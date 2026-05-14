import type { MessageRole, MessageStatus } from "@prisma/client";

/**
 * Application-layer message shape returned to clients.
 */
export interface MessageView {
  id: string;
  role: MessageRole;
  status: MessageStatus;
  content: string;
  tokenCount: number | null;
  metadata: MessageMetadata;
  feedbackRating: string | null;
  createdAt: Date;
}

/**
 * Structured metadata attached to assistant messages.
 *
 * Keeps AI-specific details (tool calls, citations, safety flags)
 * separate from the user-facing content so the frontend can
 * render them in contextual UI (e.g. source cards, action cards).
 */
export interface MessageMetadata {
  /** Citations / source references the AI grounded its answer in */
  citations?: Citation[];
  /** Tool calls the AI requested (function-calling pattern) */
  toolCalls?: ToolCallRecord[];
  /** Safety classification from guardrail checks */
  safety?: SafetyFlag;
  /** Model that generated this specific message (may differ from conversation default) */
  model?: string;
  /** Processing duration in ms (orchestration latency) */
  durationMs?: number;
}

export interface Citation {
  title: string;
  url?: string;
  snippet?: string;
}

export interface ToolCallRecord {
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

export interface SafetyFlag {
  flagged: boolean;
  categories?: string[];
  reason?: string;
}
