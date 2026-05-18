import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { randomUUID } from "node:crypto";
import { AiAuditLogger, patchCorrelationContext } from "../../common/logger";
import { openaiConfig } from "../../config/configs/openai.config";
import type {
  AiCompletionRequest,
  AiCompletionResponse,
  AiStreamChunk,
  SystemPromptContext,
} from "../conversations/interfaces";
import type { MessageMetadata } from "../conversations/interfaces/message.interface";
import type { AiProvider, ProviderMessage } from "./providers";
import { AI_PROVIDER } from "./providers";
import { AiGuardrailsService } from "./guardrails";
import { EMERGENCY_USER_FACING_PREFIX } from "./guardrails/escalation-messages";
import { PromptAssemblerService } from "./prompts/prompt-assembler.service";
import { AiResponseValidatorService } from "./validation/ai-response-validator.service";
import { ORCHESTRATED_RESPONSE_JSON_SCHEMA } from "./schemas/orchestrated-json-schema";

/**
 * AI orchestration service — single boundary between application logic and providers.
 *
 * Pipeline:
 *   1. Assemble layered system prompt (guardrails + admin instructions + context)
 *   2. Pre-validate input
 *   3. Call provider (with retry/timeout inside provider)
 *   4. Post-validate output
 *   5. Return frontend-safe response
 *
 * Never persists data or exposes secrets.
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @Inject(openaiConfig.KEY)
    private readonly config: ConfigType<typeof openaiConfig>,
    @Inject(AI_PROVIDER)
    private readonly provider: AiProvider,
    private readonly guardrails: AiGuardrailsService,
    private readonly promptAssembler: PromptAssemblerService,
    private readonly responseValidator: AiResponseValidatorService,
    private readonly aiAudit: AiAuditLogger,
  ) {
    this.logger.log(`AI provider: ${this.provider.name} [openai=${this.config.enabled}]`);
  }

  get isEnabled(): boolean {
    return true;
  }

  get providerName(): string {
    return this.provider.name;
  }

  get usesLiveOpenAi(): boolean {
    return this.config.enabled && this.provider.name === "openai";
  }

  get structuredOutputEnabled(): boolean {
    return this.config.useStructuredOutput;
  }

  async complete(
    request: AiCompletionRequest,
    promptContext?: SystemPromptContext,
  ): Promise<AiCompletionResponse> {
    const requestId = randomUUID();
    const orchestrationId = randomUUID();
    const model = request.model ?? this.config.model;
    const startTime = Date.now();

    patchCorrelationContext({
      orchestrationId,
      conversationId: request.conversationId,
      userId: request.userId,
    });

    const systemMessage = await this.promptAssembler.assemble(
      promptContext ?? { userId: request.userId },
      request.instructionSnapshot,
    );

    const providerMessages = this.buildProviderMessages(systemMessage, request.messages, undefined);

    const preCheck = this.guardrails.preValidate(providerMessages, {
      userId: request.userId,
      requestId,
    });

    if (!preCheck.allowed) {
      throw new BadRequestException(preCheck.reason);
    }

    if (preCheck.injectSystemNote) {
      providerMessages.splice(1, 0, {
        role: "system",
        content: preCheck.injectSystemNote,
      });
    }

    if (preCheck.warning?.code === "MEDICAL_EMERGENCY") {
      this.aiAudit.logEscalation({
        requestId,
        userId: request.userId,
        type: preCheck.warning.code,
      });
    }

    const useStructured =
      request.structuredOutput === true ||
      (request.structuredOutput !== false && this.config.useStructuredOutput);

    this.aiAudit.logOrchestrationStart({
      requestId,
      orchestrationId,
      userId: request.userId,
      conversationId: request.conversationId,
      model,
      provider: this.provider.name,
      messageCount: request.messages.length,
      messages: request.messages,
    });

    let providerResponse;
    try {
      providerResponse = await this.provider.complete({
        messages: providerMessages,
        model,
        maxTokens: request.maxTokens ?? this.config.maxTokens,
        temperature: request.temperature ?? this.config.temperature,
        requestId,
        ...(useStructured && {
          responseFormat: {
            type: "json_schema" as const,
            name: "auryn_orchestrated_response",
            schema: ORCHESTRATED_RESPONSE_JSON_SCHEMA,
            strict: true,
          },
        }),
      });
    } catch (error: unknown) {
      this.aiAudit.logOrchestrationError({
        requestId,
        userId: request.userId,
        conversationId: request.conversationId,
        error: error instanceof Error ? error.message : String(error),
        durationMs: Date.now() - startTime,
      });
      throw error;
    }

    let finalContent = providerResponse.content;
    let structuredMeta: MessageMetadata["orchestration"];

    if (useStructured) {
      const validated = this.responseValidator.validateOrchestratedJson(
        providerResponse.content,
        requestId,
      );
      if (validated.valid) {
        finalContent = validated.data.content;
        structuredMeta = {
          structured: validated.data as unknown as Record<string, unknown>,
        };
        if (validated.data.disclaimer) {
          finalContent += `\n\n*${validated.data.disclaimer}*`;
        }
      } else {
        this.aiAudit.logValidationFailure({
          requestId,
          userId: request.userId,
          reason: "structured_parse_failed",
          stage: "structured",
        });
        structuredMeta = { structuredParseFailed: true };
        finalContent =
          "I want to support you, but I had trouble formatting a complete response. " +
          "Could you rephrase your question? For urgent medical concerns, please contact your care team or emergency services.";
      }
    }

    const postCheck = this.guardrails.postValidate(finalContent, {
      userId: request.userId,
      requestId,
    });

    if (!postCheck.safe) {
      this.logger.warn(`[${requestId}] AI response blocked: ${postCheck.code}`);
      return {
        content: postCheck.reason,
        model: providerResponse.model,
        tokenCount: tokenUsage(providerResponse),
        metadata: { safety: { flagged: true, reason: postCheck.code } },
        finishReason: "content_filter",
      };
    }

    finalContent = postCheck.sanitized ?? finalContent;

    if (preCheck.warning?.code === "MEDICAL_EMERGENCY") {
      finalContent = EMERGENCY_USER_FACING_PREFIX + finalContent;
    }

    this.aiAudit.logOrchestrationComplete({
      requestId,
      userId: request.userId,
      conversationId: request.conversationId,
      durationMs: Date.now() - startTime,
      model: providerResponse.model,
      provider: this.provider.name,
      tokenTotal: providerResponse.usage.totalTokens,
      finishReason: providerResponse.finishReason,
      responsePreview: finalContent,
    });

    return {
      content: finalContent,
      model: providerResponse.model,
      tokenCount: tokenUsage(providerResponse),
      metadata: {
        model: providerResponse.model,
        durationMs: Date.now() - startTime,
        provider: this.provider.name,
        ...(structuredMeta ? { orchestration: structuredMeta } : {}),
        ...(preCheck.warning ? { safety: { flagged: false, reason: preCheck.warning.code } } : {}),
        ...(postCheck.flag ? { safety: { flagged: false, reason: postCheck.flag.code } } : {}),
      },
      finishReason: providerResponse.finishReason,
    };
  }

  async *stream(
    request: AiCompletionRequest,
    promptContext?: SystemPromptContext,
  ): AsyncGenerator<AiStreamChunk> {
    const requestId = randomUUID();
    const orchestrationId = randomUUID();
    const streamId = randomUUID();
    const model = request.model ?? this.config.model;
    const streamStart = Date.now();

    patchCorrelationContext({
      orchestrationId,
      streamId,
      conversationId: request.conversationId,
      userId: request.userId,
    });

    const systemMessage = await this.promptAssembler.assemble(
      promptContext ?? { userId: request.userId },
      request.instructionSnapshot,
    );

    const providerMessages = this.buildProviderMessages(systemMessage, request.messages);

    const preCheck = this.guardrails.preValidate(providerMessages, {
      userId: request.userId,
      requestId,
    });

    if (!preCheck.allowed) {
      throw new BadRequestException(preCheck.reason);
    }

    if (preCheck.injectSystemNote) {
      providerMessages.splice(1, 0, { role: "system", content: preCheck.injectSystemNote });
    }

    let assembled = "";
    if (preCheck.warning?.code === "MEDICAL_EMERGENCY") {
      assembled = EMERGENCY_USER_FACING_PREFIX;
      this.aiAudit.logEscalation({
        requestId,
        userId: request.userId,
        type: preCheck.warning.code,
      });
      yield { delta: assembled, done: false };
    }

    this.aiAudit.logStreamStart({
      requestId,
      userId: request.userId,
      conversationId: request.conversationId,
      model,
      provider: this.provider.name,
      streamId,
    });

    for await (const chunk of this.provider.stream({
      messages: providerMessages,
      model,
      maxTokens: request.maxTokens ?? this.config.maxTokens,
      temperature: request.temperature ?? this.config.temperature,
      requestId,
    })) {
      if (!chunk.done) {
        assembled += chunk.delta;
        yield { delta: chunk.delta, done: false };
        continue;
      }

      const postCheck = this.guardrails.postValidate(assembled, {
        userId: request.userId,
        requestId,
      });

      if (!postCheck.safe) {
        yield {
          delta: postCheck.reason,
          done: true,
          finishReason: "content_filter",
        };
        return;
      }

      const sanitized = postCheck.sanitized ?? assembled;
      if (postCheck.sanitized && postCheck.sanitized !== assembled) {
        yield { delta: sanitized.slice(assembled.length), done: false };
      }

      this.aiAudit.logStreamComplete({
        requestId,
        userId: request.userId,
        conversationId: request.conversationId,
        durationMs: Date.now() - streamStart,
        tokenTotal: chunk.usage?.totalTokens,
      });

      yield {
        delta: "",
        done: true,
        usage: chunk.usage
          ? {
              prompt: chunk.usage.promptTokens,
              completion: chunk.usage.completionTokens,
              total: chunk.usage.totalTokens,
            }
          : undefined,
        finishReason: chunk.finishReason ?? "stop",
      };
    }
  }

  private buildProviderMessages(
    systemMessage: string,
    history: AiCompletionRequest["messages"],
    injectNote?: string,
  ): ProviderMessage[] {
    const messages: ProviderMessage[] = [{ role: "system", content: systemMessage }];
    if (injectNote) {
      messages.push({ role: "system", content: injectNote });
    }
    for (const m of history) {
      messages.push({
        role: m.role as ProviderMessage["role"],
        content: m.content,
      });
    }
    return messages;
  }
}

function tokenUsage(providerResponse: {
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}) {
  return {
    prompt: providerResponse.usage.promptTokens,
    completion: providerResponse.usage.completionTokens,
    total: providerResponse.usage.totalTokens,
  };
}
