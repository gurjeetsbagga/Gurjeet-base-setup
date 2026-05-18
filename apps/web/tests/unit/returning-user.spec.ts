import { describe, expect, it, beforeEach } from "vitest";
import {
  getReturningUserProfile,
  isReturningUser,
  saveReturningUserProfile,
} from "@/lib/auth/returning-user";

describe("returning-user", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores profile for returning login", () => {
    saveReturningUserProfile({ email: "marcus@auryn.test", displayName: "Marcus A." });
    expect(isReturningUser()).toBe(true);
    expect(getReturningUserProfile()).toMatchObject({
      email: "marcus@auryn.test",
      displayName: "Marcus A.",
      initials: "MA",
    });
  });
});
