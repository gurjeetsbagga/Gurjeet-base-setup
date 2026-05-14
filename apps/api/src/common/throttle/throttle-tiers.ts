/**
 * Named throttle tier constants.
 *
 * Used with @Throttle({ [TIER]: { limit, ttl } }) to apply
 * per-controller or per-route overrides.
 *
 * Tiers defined in ThrottlerModule.forRootAsync:
 *   - global: baseline for all endpoints
 *   - ai:     AI completion endpoints (expensive, limited)
 *   - auth:   login, register, refresh (brute-force protection)
 *   - strict: password reset, OTP (abuse prevention)
 */
export const THROTTLE_GLOBAL = "global";
export const THROTTLE_AI = "ai";
export const THROTTLE_AUTH = "auth";
export const THROTTLE_STRICT = "strict";
