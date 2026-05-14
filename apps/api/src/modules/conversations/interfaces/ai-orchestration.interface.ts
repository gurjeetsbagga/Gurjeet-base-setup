import type { MessageMetadata } from "./message.interface";

/**
 * Contract between the ConversationsService (orchestrator) and the
 * AiService (AI boundary). The conversations module NEVER calls
 * OpenAI directly — it goes through this interface.
 *
 * This keeps the AI provider swappable and lets us add guardrails,
 * caching, rate limiting, and streaming at the boundary.
 */
export interface AiCompletionRequest {
  /** Conversation history (already trimmed to context window) */
  messages: AiMessage[];
  /** Model override (falls back to config default) */
  model?: string;
  /** Max tokens for the completion */
  maxTokens?: number;
  /** Temperature override */
  temperature?: number;
  /** User ID for rate limiting and audit */
  userId: string;
  /** Conversation ID for logging correlation */
  conversationId: string;
}

export interface AiMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Synchronous completion result from the AI boundary.
 */
export interface AiCompletionResponse {
  content: string;
  model: string;
  tokenCount: {
    prompt: number;
    completion: number;
    total: number;
  };
  metadata: MessageMetadata;
  finishReason: "stop" | "length" | "tool_calls" | "content_filter";
}

/**
 * Streaming chunk emitted by the AI boundary.
 *
 * The conversations controller can forward these chunks via SSE
 * to the frontend for real-time typing effects.
 */
export interface AiStreamChunk {
  /** Incremental text delta */
  delta: string;
  /** True when the stream is complete */
  done: boolean;
  /** Only present on the final chunk */
  usage?: AiCompletionResponse["tokenCount"];
  /** Only present on the final chunk */
  finishReason?: AiCompletionResponse["finishReason"];
}

/**
 * System prompt builder context — passed to the prompt assembly layer
 * so it can personalize the system message.
 */
export interface SystemPromptContext {
  userId: string;
  displayName?: string;
  onboardingStatus?: string;
  /** Summary of prior conversations from Private Brain */
  memorySummary?: string;
  /** Current recovery plan context */
  recoveryContext?: string;
}
