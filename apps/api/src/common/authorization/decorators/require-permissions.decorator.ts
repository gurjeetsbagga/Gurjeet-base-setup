import { SetMetadata } from "@nestjs/common";
import { Permission } from "../permissions.enum";

export const PERMISSIONS_KEY = "permissions";

/**
 * Declares the permissions required for a route or controller.
 *
 * By default, ALL listed permissions must be satisfied (AND logic).
 * For OR logic (any one permission suffices), use @RequireAnyPermission().
 *
 * Enforced by the global PermissionsGuard.
 * Requires JwtAuthGuard to have already populated `request.user`.
 *
 * Usage:
 *   @RequirePermissions(Permission.MANAGE_USERS)
 *   @Patch("users/:id/role")
 *   updateRole() { ... }
 */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, { permissions, mode: "all" as const });

/**
 * Like @RequirePermissions(), but the user only needs ONE of the
 * listed permissions (OR logic).
 *
 * Usage:
 *   @RequireAnyPermission(Permission.READ_ALL_USERS, Permission.READ_SYSTEM_OVERVIEW)
 *   @Get("dashboard")
 *   getDashboard() { ... }
 */
export const RequireAnyPermission = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, { permissions, mode: "any" as const });
