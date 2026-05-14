import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Extracts the authenticated user from the request object.
 * The user is attached by the auth guard (e.g. SupabaseAuthGuard).
 *
 * Usage:
 *   @Get("profile")
 *   getProfile(@CurrentUser() user: AuthUser) { ... }
 *
 *   @Get("profile")
 *   getEmail(@CurrentUser("email") email: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: Record<string, unknown> }>();
    const user = request.user;

    if (!user) return null;
    return data ? user[data] : user;
  },
);
