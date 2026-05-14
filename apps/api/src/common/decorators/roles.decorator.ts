import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../../modules/auth/interfaces";

export const ROLES_KEY = "roles";

/**
 * Restricts a route to users with the specified roles.
 * Enforced by the global RolesGuard (registered via APP_GUARD).
 *
 * With role hierarchy enabled in RolesGuard:
 *   ADMIN inherits PROVIDER + USER
 *   PROVIDER inherits USER
 *
 * So @Roles(UserRole.USER) allows admin and provider access too.
 *
 * Usage:
 *   @Roles(UserRole.ADMIN)
 *   @Get("dashboard")
 *   getAdminDashboard() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
