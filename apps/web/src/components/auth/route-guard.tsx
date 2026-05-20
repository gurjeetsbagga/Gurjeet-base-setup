"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/auth-provider";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { isAuthOnlyPath, isProtectedPath } from "@/lib/auth/routes";
import { syncSessionCookie } from "@/lib/auth/session";

function RouteGuardSpinner({ variant = "dashboard" }: { variant?: "dashboard" | "auth" }) {
  return (
    <div
      className={
        variant === "auth"
          ? "flex min-h-dvh items-center justify-center auth-canvas"
          : "flex min-h-dvh items-center justify-center bg-dashboard-canvas"
      }
    >
      <div
        className={
          variant === "auth"
            ? "h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-auth-brand"
            : "h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-dashboard-brand"
        }
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

/**
 * Client route guard — enforces auth using tokens in localStorage.
 * Works with `middleware.ts` (session cookie) for faster server redirects.
 */
export function RouteGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const protectedRoute = isProtectedPath(pathname);
  const authOnlyRoute = isAuthOnlyPath(pathname);

  useEffect(() => {
    if (isAuthenticated) {
      syncSessionCookie();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isLoading) return;

    if (protectedRoute && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (authOnlyRoute && isAuthenticated) {
      const params = new URLSearchParams(window.location.search);
      router.replace(getSafeRedirectPath(params.get("redirect")));
    }
  }, [authOnlyRoute, isAuthenticated, isLoading, pathname, protectedRoute, router]);

  if (isLoading) {
    return <RouteGuardSpinner variant={authOnlyRoute ? "auth" : "dashboard"} />;
  }

  if (protectedRoute && !isAuthenticated) {
    return <RouteGuardSpinner variant="dashboard" />;
  }

  if (authOnlyRoute && isAuthenticated) {
    return <RouteGuardSpinner variant="auth" />;
  }

  return <>{children}</>;
}

/** @deprecated Use RouteGuard via Providers — kept for layout-level use if needed */
export function RequireAuth({ children }: { children: ReactNode }) {
  return <RouteGuard>{children}</RouteGuard>;
}

/** @deprecated Prefer global RouteGuard — kept for explicit auth page wrappers */
export function RedirectIfAuthenticated({
  children,
  fallback = "/",
}: {
  children: ReactNode;
  fallback?: string;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const params = new URLSearchParams(window.location.search);
    router.replace(getSafeRedirectPath(params.get("redirect"), fallback));
  }, [isAuthenticated, isLoading, router, fallback]);

  if (isLoading || isAuthenticated) {
    return <RouteGuardSpinner variant="auth" />;
  }

  return <>{children}</>;
}
