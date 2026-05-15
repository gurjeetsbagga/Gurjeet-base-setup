import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { randomUUID } from "node:crypto";
import { openaiConfig } from "../../config/configs/openai.config";
import type {
  AiCompletionRequest,
  AiCompletionResponse,
  AiStreamChunk,
  SystemPromptContext,
} from "../conversations/interfaces";
import type { AiProvider, ProviderMessage } from "./providers";
import { AI_PROVIDER } from "./providers";
import { AiGuardrailsService } from "./guardrails";
import { EMERGENCY_USER_FACING_PREFIX } from "./guardrails/escalation-messages";
import { PromptAssemblerService } from "./prompts/prompt-assembler.service";

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

  async complete(
    request: AiCompletionRequest,
    promptContext?: SystemPromptContext,
  ): Promise<AiCompletionResponse> {
    const requestId = randomUUID();
    const model = request.model ?? this.config.model;
    const startTime = Date.now();

    const systemMessage = await this.promptAssembler.assemble(
      promptContext ?? { userId: request.userId },
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

    const providerResponse = await this.provider.complete({
      messages: providerMessages,
      model,
      maxTokens: request.maxTokens ?? this.config.maxTokens,
      temperature: request.temperature ?? this.config.temperature,
      requestId,
    });

    let finalContent = providerResponse.content;

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

    return {
      content: finalContent,
      model: providerResponse.model,
      tokenCount: tokenUsage(providerResponse),
      metadata: {
        model: providerResponse.model,
        durationMs: Date.now() - startTime,
        provider: this.provider.name,
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
    const model = request.model ?? this.config.model;

    const systemMessage = await this.promptAssembler.assemble(
      promptContext ?? { userId: request.userId },
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
      yield { delta: assembled, done: false };
    }

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
