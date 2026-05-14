import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RESOURCE_OWNER_KEY, type ResourceOwnerMeta } from "../decorators/resource-owner.decorator";
import { isAdmin } from "../authorization.utils";
import type { AuthUser } from "../../../modules/auth/interfaces";
import type { Request } from "express";

/**
 * Enforces resource ownership based on @ResourceOwner() metadata.
 *
 * Compares `request.user.id` with `request.params[paramField]`.
 * When `adminOverride` is true (default), admins bypass the check.
 *
 * If no @ResourceOwner() metadata is present, the guard passes
 * through (ownership checking is opt-in).
 */
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const meta = this.reflector.getAllAndOverride<ResourceOwnerMeta | undefined>(
      RESOURCE_OWNER_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!meta) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser; params: Record<string, string> }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("Access denied");
    }

    if (meta.adminOverride && isAdmin(user.roles)) {
      return true;
    }

    const resourceOwnerId = request.params[meta.paramField];

    if (!resourceOwnerId) {
      return true;
    }

    if (user.id !== resourceOwnerId) {
      throw new ForbiddenException("You do not own this resource");
    }

    return true;
  }
}
