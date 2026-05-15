import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../../../common/decorators/public.decorator";
import { AuthService } from "../auth.service";
import type { AuthUser } from "../interfaces";
import type { Request } from "express";

/**
 * Global-ready JWT auth guard.
 *
 * When registered as APP_GUARD, every route requires a valid
 * Bearer token unless explicitly marked with @Public().
 *
 * After validation, attaches a normalized `AuthUser` to `request.user`
 * using the application user id (Prisma `users.id`).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException("Missing authorization token");
    }

    const authUser = await this.authService.resolveAuthUserFromToken(token);
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
