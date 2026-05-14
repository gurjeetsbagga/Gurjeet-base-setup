import type { UserRole } from "./auth-user.interface";

/**
 * Shape of the JWT payload decoded from a Supabase access token.
 *
 * Supabase JWTs contain standard claims plus custom `app_metadata`
 * and `user_metadata`. This interface captures the subset the
 * backend cares about.
 */
export interface JwtPayload {
  /** Subject — Supabase user ID */
  sub: string;

  email?: string;

  /** Token audience (typically the Supabase project ref) */
  aud: string;

  /** Issued-at (Unix seconds) */
  iat: number;

  /** Expiry (Unix seconds) */
  exp: number;

  /** Application roles extracted from app_metadata */
  roles?: UserRole[];
}

/**
 * Token pair returned to clients after authentication.
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
