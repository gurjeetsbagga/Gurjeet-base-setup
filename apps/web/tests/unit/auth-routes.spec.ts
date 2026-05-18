import { describe, expect, it } from "vitest";
import { isAuthOnlyPath, isProtectedPath } from "@/lib/auth/routes";

describe("auth routes", () => {
  it("detects protected dashboard and chat paths", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/dashboard/health")).toBe(true);
    expect(isProtectedPath("/chat")).toBe(true);
    expect(isProtectedPath("/chat/abc-123")).toBe(true);
    expect(isProtectedPath("/plan")).toBe(true);
    expect(isProtectedPath("/onboarding")).toBe(true);
  });

  it("detects auth-only paths", () => {
    expect(isAuthOnlyPath("/login")).toBe(true);
    expect(isAuthOnlyPath("/signup")).toBe(true);
  });

  it("allows public paths", () => {
    expect(isProtectedPath("/login")).toBe(false);
    expect(isAuthOnlyPath("/dashboard")).toBe(false);
    expect(isProtectedPath("/")).toBe(false);
  });
});
