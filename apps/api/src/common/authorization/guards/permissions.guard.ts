import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/require-permissions.decorator";
import { Permission } from "../permissions.enum";
import { hasAllPermissions, hasAnyPermission } from "../authorization.utils";
import type { AuthUser } from "../../../modules/auth/interfaces";
import type { Request } from "express";

interface PermissionsMeta {
  permissions: Permission[];
  mode: "all" | "any";
}

/**
 * Enforces permission requirements set by @RequirePermissions()
 * or @RequireAnyPermission().
 *
 * Resolves user roles → permissions using the role-permission map
 * and role hierarchy, then checks against the declared requirements.
 *
 * If no permission metadata is present, access is allowed
 * (permission-checking is opt-in).
 *
 * Must run after JwtAuthGuard (request.user must be populated).
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const meta = this.reflector.getAllAndOverride<PermissionsMeta | undefined>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!meta || meta.permissions.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("Access denied");
    }

    const satisfied =
      meta.mode === "any"
        ? hasAnyPermission(user.roles, meta.permissions)
        : hasAllPermissions(user.roles, meta.permissions);

    if (!satisfied) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
