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

/**
 * Paths checked by Next.js middleware are declared inline in `middleware.ts`.
 * Next.js statically parses the exported `config` and cannot follow imports
 * or spread expressions, so the matcher must live alongside the middleware.
 * Keep that literal array in sync with the prefixes above when adding routes.
 */
