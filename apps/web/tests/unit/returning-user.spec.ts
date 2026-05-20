import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearReturningUserProfile,
  getReturningUserProfile,
  isReturningUser,
  markWelcomeBackModalShown,
  saveReturningUserProfile,
  shouldShowWelcomeBackModal,
} from "@/lib/auth/returning-user";

describe("returning-user", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("saves and reads returning profile", () => {
    saveReturningUserProfile({ email: "a@b.com", displayName: "Alex User" });
    expect(isReturningUser()).toBe(true);
    const profile = getReturningUserProfile();
    expect(profile?.email).toBe("a@b.com");
    expect(profile?.displayName).toBe("Alex User");
    expect(profile?.initials).toBe("AU");
  });

  it("clears returning profile", () => {
    saveReturningUserProfile({ email: "a@b.com" });
    clearReturningUserProfile();
    expect(isReturningUser()).toBe(false);
    expect(getReturningUserProfile()).toBeNull();
  });

  it("shows welcome modal once per session", () => {
    saveReturningUserProfile({ email: "a@b.com" });
    expect(shouldShowWelcomeBackModal()).toBe(true);
    markWelcomeBackModalShown();
    expect(shouldShowWelcomeBackModal()).toBe(false);
  });
});
