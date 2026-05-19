/**
 * Cross-cutting product limits shared between apps.
 *
 * Keep this module small and free of runtime dependencies — it is imported
 * by the web app (browser bundle), the API, and the mobile app.
 */

/**
 * Anonymous-chat preview limits. Unauthenticated visitors can exchange a small
 * number of messages with Auryn before the login gate fires.
 *
 * Phase 1 (web only, no backend): enforced client-side from localStorage. This
 * is a UX guard, not a security boundary. Backend enforcement lands in Phase 2
 * along with the `anonymous_sessions` schema.
 */
export const ANONYMOUS_CHAT = {
  /** Maximum user messages before the login gate is shown. */
  MAX_MESSAGES: 5,
  /** Days an anonymous session may live before being purged. */
  SESSION_TTL_DAYS: 30,
} as const;
