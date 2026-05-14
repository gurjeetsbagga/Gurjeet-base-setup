import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { openaiConfig, redactApiKey } from "../../../config/configs/openai.config";
import type {
  AiProvider,
  ProviderRequest,
  ProviderResponse,
  ProviderStreamChunk,
} from "./ai-provider.interface";

/**
 * OpenAI provider — will call the OpenAI Chat Completions API.
 *
 * Currently scaffolded without the `openai` SDK dependency.
 * When activated:
 *   1. Install `openai` package
 *   2. Initialize the client in onModuleInit
 *   3. Implement complete() with chat.completions.create()
 *   4. Implement stream() with chat.completions.create({ stream: true })
 *
 * Security invariants:
 *   - API key is NEVER logged, serialized, or included in error responses
 *   - Config object has a toJSON override that redacts secrets
 *   - The provider NEVER persists data or touches the database
 *   - Only the redacted key mask appears in startup logs
 */
@Injectable()
export class OpenAiProvider implements AiProvider, OnModuleInit {
  readonly name = "openai";
  private readonly logger = new Logger(OpenAiProvider.name);

  constructor(
    @Inject(openaiConfig.KEY)
    private readonly config: ConfigType<typeof openaiConfig>,
  ) {}

  onModuleInit(): void {
    this.logger.log(
      `OpenAI provider initialized: model=${this.config.model} ` +
        `key=${redactApiKey(this.config.apiKey)} ` +
        `org=${this.config.orgId ? "[SET]" : "(not set)"}`,
    );
  }

  async complete(request: ProviderRequest): Promise<ProviderResponse> {
    this.logger.debug(
      `[${request.requestId}] OpenAI completion: model=${request.model} messages=${request.messages.length}`,
    );

    // TODO: Replace with actual OpenAI SDK call:
    //
    // const client = new OpenAI({ apiKey: this.config.apiKey, organization: this.config.orgId });
    // const response = await client.chat.completions.create({
    //   model: request.model,
    //   messages: request.messages,
    //   max_tokens: request.maxTokens,
    //   temperature: request.temperature,
    //   ...(request.responseFormat && {
    //     response_format: {
    //       type: "json_schema",
    //       json_schema: {
    //         name: request.responseFormat.name,
    //         schema: request.responseFormat.schema,
    //         strict: request.responseFormat.strict,
    //       },
    //     },
    //   }),
    // });

    return {
      content:
        "I'm Auryn, your wellness companion. " +
        "OpenAI integration is prepared but not yet connected.",
      model: request.model,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      finishReason: "stop",
    };
  }

  async *stream(request: ProviderRequest): AsyncGenerator<ProviderStreamChunk> {
    this.logger.debug(`[${request.requestId}] OpenAI stream: model=${request.model}`);

    // TODO: Replace with actual streaming:
    //
    // const client = new OpenAI({ apiKey: this.config.apiKey });
    // const stream = await client.chat.completions.create({
    //   model: request.model,
    //   messages: request.messages,
    //   max_tokens: request.maxTokens,
    //   temperature: request.temperature,
    //   stream: true,
    // });
    //
    // for await (const chunk of stream) {
    //   const delta = chunk.choices[0]?.delta?.content ?? "";
    //   const done = chunk.choices[0]?.finish_reason !== null;
    //   yield { delta, done };
    // }

    const placeholder = "Auryn streaming is prepared but not yet connected to OpenAI.";
    for (const char of placeholder) {
      yield { delta: char, done: false };
    }
    yield { delta: "", done: true, finishReason: "stop" };
  }
}
