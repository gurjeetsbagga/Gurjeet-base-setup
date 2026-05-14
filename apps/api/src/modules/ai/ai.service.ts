import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
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
import { buildSystemPrompt } from "./prompts";

/**
 * AI orchestration service — the single boundary between
 * application logic and AI providers.
 *
 * Pipeline:
 *   1. Assemble system prompt from user context
 *   2. Pre-validate input (guardrails)
 *   3. Build provider request
 *   4. Call provider (sync or streaming)
 *   5. Post-validate output (guardrails)
 *   6. Return validated, safe response
 *
 * This service NEVER:
 *   - Persists messages (that's the orchestrator's job)
 *   - Writes to the database
 *   - Exposes API keys or provider details to callers
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
  ) {
    this.logger.log(`AI provider: ${this.provider.name} [enabled=${this.config.enabled}]`);
  }

  get isEnabled(): boolean {
    return this.config.enabled;
  }

  get providerName(): string {
    return this.provider.name;
  }

  /**
   * Synchronous completion — full pipeline.
   */
  async complete(
    request: AiCompletionRequest,
    promptContext?: SystemPromptContext,
  ): Promise<AiCompletionResponse> {
    this.ensureEnabled();

    const requestId = randomUUID();
    const model = request.model ?? this.config.model;
    const startTime = Date.now();

    this.logger.debug(
      `[${requestId}] Completion requested: conversation=${request.conversationId} ` +
        `messages=${request.messages.length} model=${model} provider=${this.provider.name}`,
    );

    const systemMessage = buildSystemPrompt(promptContext ?? { userId: request.userId });

    const providerMessages: ProviderMessage[] = [
      { role: "system", content: systemMessage },
      ...request.messages.map((m) => ({
        role: m.role as ProviderMessage["role"],
        content: m.content,
      })),
    ];

    const preCheck = this.guardrails.preValidate(providerMessages, {
      userId: request.userId,
      requestId,
    });

    if (!preCheck.allowed) {
      throw new BadRequestException(preCheck.reason);
    }

    const providerResponse = await this.provider.complete({
      messages: providerMessages,
      model,
      maxTokens: request.maxTokens ?? this.config.maxTokens,
      temperature: request.temperature ?? this.config.temperature,
      requestId,
    });

    const postCheck = this.guardrails.postValidate(providerResponse.content, {
      userId: request.userId,
      requestId,
    });

    if (!postCheck.safe) {
      this.logger.warn(`[${requestId}] AI response blocked: ${postCheck.code}`);
      return {
        content: postCheck.reason,
        model: providerResponse.model,
        tokenCount: {
          prompt: providerResponse.usage.promptTokens,
          completion: providerResponse.usage.completionTokens,
          total: providerResponse.usage.totalTokens,
        },
        metadata: { safety: { flagged: true, reason: postCheck.code } },
        finishReason: "content_filter",
      };
    }

    const finalContent = postCheck.sanitized ?? providerResponse.content;
    const durationMs = Date.now() - startTime;

    this.logger.debug(
      `[${requestId}] Completion done: ${durationMs}ms tokens=${providerResponse.usage.totalTokens}`,
    );

    return {
      content: finalContent,
      model: providerResponse.model,
      tokenCount: {
        prompt: providerResponse.usage.promptTokens,
        completion: providerResponse.usage.completionTokens,
        total: providerResponse.usage.totalTokens,
      },
      metadata: {
        model: providerResponse.model,
        durationMs,
        ...(preCheck.allowed && preCheck.warning
          ? { safety: { flagged: false, reason: preCheck.warning.code } }
          : {}),
        ...(postCheck.flag ? { safety: { flagged: false, reason: postCheck.flag.code } } : {}),
      },
      finishReason: providerResponse.finishReason,
    };
  }

  /**
   * Streaming completion — yields validated chunks.
   *
   * Pre-guardrails run before the stream starts.
   * Post-guardrails run on the assembled full response
   * after the stream completes (final chunk includes safety check).
   */
  async *stream(
    request: AiCompletionRequest,
    promptContext?: SystemPromptContext,
  ): AsyncGenerator<AiStreamChunk> {
    this.ensureEnabled();

    const requestId = randomUUID();
    const model = request.model ?? this.config.model;

    const systemMessage = buildSystemPrompt(promptContext ?? { userId: request.userId });

    const providerMessages: ProviderMessage[] = [
      { role: "system", content: systemMessage },
      ...request.messages.map((m) => ({
        role: m.role as ProviderMessage["role"],
        content: m.content,
      })),
    ];

    const preCheck = this.guardrails.preValidate(providerMessages, {
      userId: request.userId,
      requestId,
    });

    if (!preCheck.allowed) {
      throw new BadRequestException(preCheck.reason);
    }

    let assembled = "";

    for await (const chunk of this.provider.stream({
      messages: providerMessages,
      model,
      maxTokens: request.maxTokens ?? this.config.maxTokens,
      temperature: request.temperature ?? this.config.temperature,
      requestId,
    })) {
      assembled += chunk.delta;

      if (chunk.done) {
        const postCheck = this.guardrails.postValidate(assembled, {
          userId: request.userId,
          requestId,
        });

        if (!postCheck.safe) {
          yield { delta: "", done: true, finishReason: "content_filter" };
          return;
        }

        yield {
          delta: chunk.delta,
          done: true,
          usage: chunk.usage
            ? {
                prompt: chunk.usage.promptTokens,
                completion: chunk.usage.completionTokens,
                total: chunk.usage.totalTokens,
              }
            : undefined,
          finishReason: chunk.finishReason,
        };
      } else {
        yield { delta: chunk.delta, done: false };
      }
    }
  }

  private ensureEnabled(): void {
    if (!this.config.enabled) {
      throw new ServiceUnavailableException(
        "AI features are not configured. Set OPENAI_API_KEY to enable.",
      );
    }
  }
}
