/**
 * Abstract contract for AI completion providers.
 *
 * All AI providers (OpenAI, Anthropic, local models, stubs)
 * implement this interface. The AiService delegates to the
 * active provider — never calls vendor SDKs directly.
 *
 * This lets us:
 *   - Swap providers without changing orchestration logic
 *   - Run a stub in development / tests without API keys
 *   - A/B test models by switching the active provider
 *   - Add fallback chains (primary → secondary on failure)
 */
export interface AiProvider {
  readonly name: string;

  /**
   * Synchronous chat completion — returns when the full response is ready.
   */
  complete(request: ProviderRequest): Promise<ProviderResponse>;

  /**
   * Streaming chat completion — yields incremental chunks.
   * The caller is responsible for assembling the final response.
   */
  stream(request: ProviderRequest): AsyncGenerator<ProviderStreamChunk>;
}

/**
 * Normalized request shape sent to any provider.
 * Provider implementations map this to their vendor-specific SDK format.
 */
export interface ProviderRequest {
  messages: ProviderMessage[];
  model: string;
  maxTokens: number;
  temperature: number;
  /** If set, the provider should attempt to return structured JSON matching this schema */
  responseFormat?: StructuredOutputFormat;
  /** Unique request ID for correlation across logs */
  requestId: string;
}

export interface ProviderMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface StructuredOutputFormat {
  type: "json_schema";
  /** JSON Schema object describing the expected response shape */
  schema: Record<string, unknown>;
  /** Human-readable name for the schema (used in OpenAI's response_format.name) */
  name: string;
  /** If true, the response must strictly match the schema (OpenAI strict mode) */
  strict?: boolean;
}

/**
 * Normalized response from any provider.
 */
export interface ProviderResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: "stop" | "length" | "tool_calls" | "content_filter";
}

/**
 * Streaming chunk from any provider.
 */
export interface ProviderStreamChunk {
  delta: string;
  done: boolean;
  usage?: ProviderResponse["usage"];
  finishReason?: ProviderResponse["finishReason"];
}

/** DI token for injecting the active AI provider */
export const AI_PROVIDER = Symbol("AI_PROVIDER");
