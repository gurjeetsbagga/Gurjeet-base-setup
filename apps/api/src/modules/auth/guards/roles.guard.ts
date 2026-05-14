import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../../../common/decorators/roles.decorator";
import { hasRole } from "../../../common/authorization/authorization.utils";
import type { AuthUser } from "../interfaces";
import { UserRole } from "../interfaces";
import type { Request } from "express";

/**
 * Enforces role requirements set by the @Roles() decorator.
 *
 * Supports role hierarchy:
 *   ADMIN  → inherits PROVIDER + USER
 *   PROVIDER → inherits USER
 *
 * Must run after JwtAuthGuard (so `request.user` is populated).
 * If no @Roles() is present on the handler or class, access is allowed
 * (role-checking is opt-in per route).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("Access denied");
    }

    const satisfied = requiredRoles.some((required) => hasRole(user.roles, required));

    if (!satisfied) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
