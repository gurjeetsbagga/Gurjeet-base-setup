import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../../../common/decorators/public.decorator";
import { SupabaseService } from "../../../integrations/supabase";
import type { AuthUser } from "../interfaces";
import { UserRole } from "../interfaces";
import type { Request } from "express";

/**
 * Global-ready JWT auth guard.
 *
 * When registered as APP_GUARD, every route requires a valid
 * Supabase JWT unless explicitly marked with @Public().
 *
 * After validation, attaches a normalized `AuthUser` to `request.user`.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly supabase: SupabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    if (!this.supabase.isEnabled) {
      throw new UnauthorizedException("Auth service unavailable");
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException("Missing authorization token");
    }

    const userClient = this.supabase.forUser(token);
    if (!userClient) {
      throw new UnauthorizedException("Auth service unavailable");
    }

    const {
      data: { user },
      error,
    } = await userClient.auth.getUser();

    if (error || !user) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    const appMetadata = (user.app_metadata ?? {}) as Record<string, unknown>;
    const rawRoles = Array.isArray(appMetadata.roles) ? appMetadata.roles : [];

    const authUser: AuthUser = {
      id: user.id,
      email: user.email ?? "",
      roles: rawRoles.filter((r): r is UserRole => Object.values(UserRole).includes(r as UserRole)),
      metadata: (user.user_metadata ?? {}) as Record<string, unknown>,
    };

    (request as Request & { user: AuthUser }).user = authUser;
    return true;
  }
}

function extractBearerToken(request: Request): string | null {
  const header = request.headers.authorization;
  if (!header) return null;

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;

  return token;
}
