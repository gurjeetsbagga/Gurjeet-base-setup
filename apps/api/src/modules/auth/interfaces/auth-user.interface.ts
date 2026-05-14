/**
 * Canonical authenticated user shape attached to `request.user`
 * by the auth guard after JWT/Supabase token validation.
 *
 * This is the application-layer representation — it is intentionally
 * decoupled from Supabase's raw `User` object so the auth layer
 * can be swapped without touching consumers.
 */
export interface AuthUser {
  /** Supabase user ID (UUID) */
  id: string;

  email: string;

  roles: UserRole[];

  /** Supabase user metadata (profile fields set at signup or updated later) */
  metadata: Record<string, unknown>;
}

/**
 * Application-level role enum.
 *
 * Roles are stored in Supabase user metadata (`app_metadata.roles`)
 * and mapped here during token validation. New roles should be added
 * here and reflected in the RolesGuard allow-list.
 */
export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  /** PhysicianOS-linked provider account */
  PROVIDER = "provider",
}
