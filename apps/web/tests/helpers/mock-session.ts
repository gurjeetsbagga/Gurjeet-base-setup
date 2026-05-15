import { vi } from "vitest";
import * as session from "@/lib/auth/session";

export function mockUnauthenticated() {
  vi.spyOn(session, "getAccessToken").mockReturnValue(null);
  vi.spyOn(session, "isAuthenticated").mockReturnValue(false);
}

export function mockAuthenticated(token = "test-token") {
  vi.spyOn(session, "getAccessToken").mockReturnValue(token);
  vi.spyOn(session, "isAuthenticated").mockReturnValue(true);
}

export function restoreSessionMocks() {
  vi.restoreAllMocks();
}
