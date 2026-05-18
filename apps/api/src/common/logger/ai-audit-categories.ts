import type { AiAuditEvent } from "./ai-audit.logger";

/** File targets under logs/audit/ */
export type AiAuditFileCategory =
  | "orchestration"
  | "streaming"
  | "safety"
  | "escalation"
  | "validation"
  | "moderation"
  | "retry"
  | "memory";

export const AI_AUDIT_FILE_MAP: Record<AiAuditEvent, AiAuditFileCategory> = {
  "ai.orchestration.start": "orchestration",
  "ai.orchestration.complete": "orchestration",
  "ai.orchestration.error": "orchestration",
  "ai.stream.start": "streaming",
  "ai.stream.chunk": "streaming",
  "ai.stream.complete": "streaming",
  "ai.retry": "retry",
  "ai.validation.failed": "validation",
  "ai.safety": "safety",
  "ai.escalation": "escalation",
  "ai.moderation": "moderation",
  "ai.memory.extract": "memory",
  "ai.memory.retrieve": "memory",
};

export const AUDIT_FILE_NAMES: Record<AiAuditFileCategory, string> = {
  orchestration: "ai-audit.log",
  streaming: "streaming-events.log",
  safety: "safety-events.log",
  escalation: "escalation-events.log",
  validation: "validation-events.log",
  moderation: "moderation-events.log",
  retry: "retry-events.log",
  memory: "memory-orchestration.log",
};
