/** Route guard configuration — keep matchers in sync with `middleware.ts`. */

/** Requires a valid session (dashboard, chat, profile, etc.). */
export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/chat",
  "/plan",
  "/recovery",
  "/private-brain",
  "/settings",
  "/profile",
  "/onboarding",
] as const;

/** Only for guests — signed-in users are redirected away (login, signup). */
export const AUTH_ONLY_ROUTE_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAuthOnlyPath(pathname: string): boolean {
  return AUTH_ONLY_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Paths checked by Next.js middleware (see `middleware.ts`). */
export const MIDDLEWARE_MATCHER = [
  "/dashboard/:path*",
  "/chat/:path*",
  "/plan",
  "/recovery",
  "/private-brain",
  "/settings",
  "/profile",
  "/onboarding",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
] as const;
