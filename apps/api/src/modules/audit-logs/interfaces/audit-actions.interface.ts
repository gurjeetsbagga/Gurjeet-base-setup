/**
 * Well-known audit action strings organized by category.
 *
 * Using a constants object (not an enum) so modules can extend
 * with their own action strings without modifying this file.
 * The audit system accepts any string — these are the canonical ones.
 */
export const AuditActions = {
  // ── Auth ──────────────────────────────────────────────
  AUTH_LOGIN: "auth.login",
  AUTH_LOGOUT: "auth.logout",
  AUTH_REGISTER: "auth.register",
  AUTH_TOKEN_REFRESH: "auth.token_refresh",
  AUTH_LOGIN_FAILED: "auth.login_failed",

  // ── User ──────────────────────────────────────────────
  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",
  USER_DEACTIVATED: "user.deactivated",
  USER_REACTIVATED: "user.reactivated",
  USER_ROLE_CHANGED: "user.role_changed",
  USER_PREFERENCES_UPDATED: "user.preferences_updated",

  // ── Conversation ──────────────────────────────────────
  CONVERSATION_CREATED: "conversation.created",
  CONVERSATION_ARCHIVED: "conversation.archived",
  CONVERSATION_DELETED: "conversation.deleted",

  // ── AI ────────────────────────────────────────────────
  AI_COMPLETION_REQUESTED: "ai.completion_requested",
  AI_COMPLETION_SUCCEEDED: "ai.completion_succeeded",
  AI_COMPLETION_FAILED: "ai.completion_failed",
  AI_GUARDRAIL_BLOCKED: "ai.guardrail_blocked",
  AI_GUARDRAIL_FLAGGED: "ai.guardrail_flagged",
  AI_STREAM_STARTED: "ai.stream_started",
  AI_STREAM_COMPLETED: "ai.stream_completed",

  // ── Action Validation ─────────────────────────────────
  ACTION_PROPOSED: "action.proposed",
  ACTION_VALIDATED: "action.validated",
  ACTION_REJECTED: "action.rejected",
  ACTION_APPROVED: "action.approved",
  ACTION_EXECUTED: "action.executed",
  ACTION_FAILED: "action.failed",
  ACTION_EXPIRED: "action.expired",

  // ── Memory ────────────────────────────────────────────
  MEMORY_STORED: "memory.stored",
  MEMORY_RETRIEVED: "memory.retrieved",
  MEMORY_DEACTIVATED: "memory.deactivated",

  // ── Admin ─────────────────────────────────────────────
  ADMIN_CONFIG_UPDATED: "admin.config_updated",
  ADMIN_PROVIDER_CHANGED: "admin.provider_changed",
  ADMIN_SETTINGS_UPDATED: "admin.settings_updated",

  // ── Moderation ────────────────────────────────────────
  MODERATION_FLAGGED: "moderation.flagged",
  MODERATION_REVIEWED: "moderation.reviewed",
  MODERATION_DISMISSED: "moderation.dismissed",
  MODERATION_ESCALATED: "moderation.escalated",

  // ── System ────────────────────────────────────────────
  SYSTEM_STARTUP: "system.startup",
  SYSTEM_SHUTDOWN: "system.shutdown",
  SYSTEM_HEALTH_DEGRADED: "system.health_degraded",
} as const;

export type AuditActionKey = keyof typeof AuditActions;
export type AuditActionValue = (typeof AuditActions)[AuditActionKey];
