/**
 * Coarse-grained permissions used across the Auryn platform.
 *
 * Naming convention: `<verb>:<scope>_<resource>`
 *   - "own" scope = restricted to the requesting user's data
 *   - "all" scope = unrestricted (admin)
 *   - no scope    = applies globally
 *
 * Roles are mapped to sets of permissions via ROLE_PERMISSIONS.
 * Controllers use @RequirePermissions() to declare what's needed;
 * the PermissionsGuard resolves the user's roles to permissions
 * and enforces the check.
 *
 * This enum is intentionally kept small — expand as features land,
 * not preemptively.
 */
export enum Permission {
  // ── User profile ──────────────────────────────────────────
  READ_OWN_PROFILE = "read:own_profile",
  UPDATE_OWN_PROFILE = "update:own_profile",

  // ── Conversations (AI chat) ───────────────────────────────
  CREATE_CONVERSATION = "create:conversation",
  READ_OWN_CONVERSATIONS = "read:own_conversations",
  SEND_MESSAGE = "send:message",

  // ── Memory (Private Brain) ────────────────────────────────
  READ_OWN_MEMORY = "read:own_memory",
  WRITE_OWN_MEMORY = "write:own_memory",

  // ── Actions ───────────────────────────────────────────────
  PROPOSE_ACTION = "propose:action",
  RESOLVE_OWN_ACTION = "resolve:own_action",

  // ── Provider (PhysicianOS-linked) ─────────────────────────
  READ_PROVIDER_DATA = "read:provider_data",
  WRITE_PROVIDER_DATA = "write:provider_data",

  // ── Admin ─────────────────────────────────────────────────
  READ_ALL_USERS = "read:all_users",
  MANAGE_USERS = "manage:users",
  READ_AUDIT_LOGS = "read:audit_logs",
  MANAGE_AI_CONFIG = "manage:ai_config",
  MANAGE_MODERATION = "manage:moderation",
  READ_SYSTEM_OVERVIEW = "read:system_overview",
}
