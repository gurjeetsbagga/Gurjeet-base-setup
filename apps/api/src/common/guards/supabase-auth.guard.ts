import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { SupabaseService } from "../../integrations/supabase";

/**
 * Guard that validates a Supabase JWT from the Authorization header.
 *
 * Extracts the Bearer token, verifies it against Supabase's `auth.getUser()`,
 * and attaches the authenticated user to `request.user`.
 *
 * Usage:
 *   @UseGuards(SupabaseAuthGuard)
 *   @Get("profile")
 *   getProfile(@Req() req: Request) { ... }
 *
 * NOTE: This is a structural preparation. Full auth flows (signup, login,
 * password reset, OAuth providers) will be implemented when the auth
 * module is built out.
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);

  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.supabase.isEnabled) {
      this.logger.warn("Supabase auth guard called but Supabase is not configured");
      throw new UnauthorizedException("Auth service unavailable");
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

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

    (request as Request & { user: unknown }).user = user;
    return true;
  }

  private extractToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (!header) return null;

    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) return null;

    return token;
  }
}
