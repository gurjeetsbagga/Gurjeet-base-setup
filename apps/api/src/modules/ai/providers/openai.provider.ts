import {
  GatewayTimeoutException,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import OpenAI from "openai";
import { AiAuditLogger } from "../../../common/logger";
import { openaiConfig, redactApiKey } from "../../../config/configs/openai.config";
import { withRetry } from "../utils/retry";
import type {
  AiProvider,
  ProviderRequest,
  ProviderResponse,
  ProviderStreamChunk,
} from "./ai-provider.interface";

@Injectable()
export class OpenAiProvider implements AiProvider, OnModuleInit {
  readonly name = "openai";
  private readonly logger = new Logger(OpenAiProvider.name);
  private client: OpenAI | null = null;

  constructor(
    @Inject(openaiConfig.KEY)
    private readonly config: ConfigType<typeof openaiConfig>,
    private readonly aiAudit: AiAuditLogger,
  ) {}

  onModuleInit(): void {
    if (!this.config.apiKey) {
      this.logger.warn("OpenAI API key not set — provider inactive");
      return;
    }

    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      organization: this.config.orgId,
      timeout: this.config.timeoutMs,
      maxRetries: 0,
    });

    this.logger.log(
      `OpenAI provider ready: model=${this.config.model} key=${redactApiKey(this.config.apiKey)}`,
    );
  }

  async complete(request: ProviderRequest): Promise<ProviderResponse> {
    const client = this.requireClient();

    return withRetry(
      async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

        try {
          const response = await client.chat.completions.create(
            {
              model: request.model,
              messages: request.messages,
              max_tokens: request.maxTokens,
              temperature: request.temperature,
              ...(request.responseFormat && {
                response_format: {
                  type: "json_schema",
                  json_schema: {
                    name: request.responseFormat.name,
                    schema: request.responseFormat.schema,
                    strict: request.responseFormat.strict ?? true,
                  },
                },
              }),
            },
            { signal: controller.signal },
          );

          const choice = response.choices[0];
          const content = choice?.message?.content ?? "";
          const usage = response.usage;

          return {
            content: typeof content === "string" ? content : "",
            model: response.model,
            usage: {
              promptTokens: usage?.prompt_tokens ?? 0,
              completionTokens: usage?.completion_tokens ?? 0,
              totalTokens: usage?.total_tokens ?? 0,
            },
            finishReason: mapFinishReason(choice?.finish_reason),
          };
        } catch (error: unknown) {
          if (error instanceof Error && error.name === "AbortError") {
            throw new GatewayTimeoutException("AI request timed out");
          }
          throw error;
        } finally {
          clearTimeout(timer);
        }
      },
      {
        maxAttempts: this.config.maxRetries,
        baseDelayMs: this.config.retryBaseDelayMs,
        maxDelayMs: 8000,
        onRetry: (info) =>
          this.aiAudit.logRetry({
            requestId: request.requestId,
            ...info,
          }),
      },
    );
  }

  async *stream(request: ProviderRequest): AsyncGenerator<ProviderStreamChunk> {
    const client = this.requireClient();

    const stream = await withRetry(
      () =>
        client.chat.completions.create(
          {
            model: request.model,
            messages: request.messages,
            max_tokens: request.maxTokens,
            temperature: request.temperature,
            stream: true,
            stream_options: { include_usage: true },
          },
          { timeout: this.config.streamTimeoutMs },
        ),
      {
        maxAttempts: this.config.maxRetries,
        baseDelayMs: this.config.retryBaseDelayMs,
        maxDelayMs: 8000,
        onRetry: (info) =>
          this.aiAudit.logRetry({
            requestId: request.requestId,
            ...info,
          }),
      },
    );

    let lastChunkAt = Date.now();

    for await (const chunk of stream) {
      if (Date.now() - lastChunkAt > this.config.streamTimeoutMs) {
        throw new GatewayTimeoutException("AI stream timed out");
      }
      lastChunkAt = Date.now();

      const delta = chunk.choices[0]?.delta?.content ?? "";
      const finishReason = chunk.choices[0]?.finish_reason;

      if (delta) {
        yield { delta, done: false };
      }

      if (finishReason) {
        const usage = chunk.usage;
        yield {
          delta: "",
          done: true,
          finishReason: mapFinishReason(finishReason),
          usage: usage
            ? {
                promptTokens: usage.prompt_tokens ?? 0,
                completionTokens: usage.completion_tokens ?? 0,
                totalTokens: usage.total_tokens ?? 0,
              }
            : undefined,
        };
        return;
      }
    }

    yield { delta: "", done: true, finishReason: "stop" };
  }

  private requireClient(): OpenAI {
    if (!this.client) {
      throw new ServiceUnavailableException(
        "OpenAI is not configured. Set OPENAI_API_KEY to enable AI features.",
      );
    }
    return this.client;
  }
}

function mapFinishReason(reason: string | null | undefined): ProviderResponse["finishReason"] {
  switch (reason) {
    case "length":
      return "length";
    case "tool_calls":
      return "tool_calls";
    case "content_filter":
      return "content_filter";
    default:
      return "stop";
  }
}
