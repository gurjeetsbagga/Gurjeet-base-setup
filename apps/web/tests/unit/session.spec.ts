import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearTokens,
  getAccessToken,
  hasUsableAccessToken,
  isAccessTokenExpired,
  isAuthenticated,
  setTokens,
} from "@/lib/auth/session";

function makeJwt(expSeconds: number): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ exp: expSeconds }));
  return `${header}.${payload}.sig`;
}

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

  it("treats expired JWT as unusable and clears storage", () => {
    const expired = makeJwt(Math.floor(Date.now() / 1000) - 60);
    localStorage.setItem("auryn_access_token", expired);
    expect(isAccessTokenExpired(expired)).toBe(true);
    expect(hasUsableAccessToken()).toBe(false);
    expect(getAccessToken()).toBeNull();
  });
});
