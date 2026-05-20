import { describe, expect, it } from "vitest";
import { isAuthOnlyPath, isProtectedPath } from "@/lib/auth/routes";

describe("auth routes", () => {
  it("detects protected dashboard paths", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/dashboard/health")).toBe(true);
    expect(isProtectedPath("/plan")).toBe(true);
    expect(isProtectedPath("/onboarding")).toBe(true);
  });

  it("treats home and /chat as public (anonymous preview, see lib/chat/anonymous-chat)", () => {
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/chat")).toBe(false);
    expect(isProtectedPath("/chat/abc-123")).toBe(false);
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
