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
  instructionVersionId: string | null;
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
  /** AI provider used for this message (e.g. openai, stub) */
  provider?: string;
  /** Validated action proposal IDs (backend pipeline only — never executed by AI) */
  proposedActionIds?: string[];
  /** Memory signals for future extraction (not persisted as memory automatically) */
  memorySignals?: string[];
  /** Assistant tone from structured output */
  tone?: string;
  /** Disclaimer text surfaced to UI */
  disclaimer?: string;
  /** Escalation hint from structured output */
  escalation?: { type: string; message?: string };
  /** Internal: parsed structured payload (not sent to clients by default) */
  orchestration?: {
    structured?: Record<string, unknown>;
    structuredParseFailed?: boolean;
  };
  /** Admin instruction versions applied for this turn (Step 1 audit) */
  appliedInstructionVersions?: AppliedInstructionVersionRef[];
}

export interface AppliedInstructionVersionRef {
  instructionId: string;
  versionId: string;
  version: number;
  slug: string;
  title: string;
  category: string;
  priority: number;
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
