import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearTokens, getAccessToken, isAuthenticated, setTokens } from "@/lib/auth/session";

describe("session", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    clearTokens();
  });

  it("stores and reads access token", () => {
    setTokens("access-123", "refresh-456");
    expect(getAccessToken()).toBe("access-123");
    expect(isAuthenticated()).toBe(true);
  });

  it("clears authentication state", () => {
    setTokens("access-123");
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });
});
