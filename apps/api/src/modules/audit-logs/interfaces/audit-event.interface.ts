/**
 * Canonical audit event structure for the Auryn platform.
 *
 * Every auditable operation — admin action, AI interaction, user mutation,
 * action validation, moderation decision — produces an AuditEvent that
 * flows through the AuditLogService for persistence and querying.
 *
 * Design principles:
 *   - Who did what to which target, when, and why
 *   - Immutable: audit records are append-only, never modified or deleted
 *   - Structured: queryable by category, action, actor, target, time range
 *   - Traceable: requestId links audit events to HTTP requests and AI calls
 */
export interface AuditEvent {
  id: string;

  /** High-level domain of the event */
  category: AuditCategory;

  /** Specific action within the category */
  action: string;

  /** Who triggered this event */
  actor: AuditActor;

  /** What was affected */
  target: AuditTarget | null;

  /** Structured details (action-specific, never contains secrets) */
  details: Record<string, unknown>;

  /** Outcome of the operation */
  outcome: AuditOutcome;

  /** HTTP request correlation ID */
  requestId: string | null;

  /** Client IP address (when available) */
  ip: string | null;

  /** User agent string (when available) */
  userAgent: string | null;

  createdAt: Date;
}

/**
 * Event categories — each maps to a domain boundary.
 * New categories are added as the platform grows.
 */
export type AuditCategory =
  | "auth"
  | "user"
  | "conversation"
  | "ai"
  | "action"
  | "memory"
  | "admin"
  | "moderation"
  | "system";

/**
 * Who triggered the event. Actors can be users, admins,
 * the system itself, or AI processes.
 */
export interface AuditActor {
  type: ActorType;
  id: string;
  /** Human-readable label (e.g. email, "system", "ai-pipeline") */
  label: string | null;
}

export type ActorType = "user" | "admin" | "system" | "ai";

/**
 * What was affected by the event.
 */
export interface AuditTarget {
  type: string;
  id: string;
  /** Human-readable label (e.g. user email, conversation title) */
  label: string | null;
}

export type AuditOutcome = "success" | "failure" | "denied" | "error";
