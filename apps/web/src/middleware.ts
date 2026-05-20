import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthOnlyPath, isProtectedPath } from "@/lib/auth/routes";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-cookie";

function hasSession(request: NextRequest): boolean {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value === "1";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = hasSession(request);

  if (isProtectedPath(pathname) && !session) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnlyPath(pathname) && session) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/";
    destination.search = "";
    return NextResponse.redirect(destination);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
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
  ],
};
