import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { validateSecretBoundaries, safeOpenAiStatus } from "@/config/validate-secrets";

describe("validateSecretBoundaries", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("passes when no client-prefixed secrets exist", () => {
    expect(() => validateSecretBoundaries()).not.toThrow();
  });

  it("warns in development when a client-exposed secret is found", () => {
    process.env.NODE_ENV = "development";
    process.env.NEXT_PUBLIC_OPENAI_API_KEY = "leaked";

    expect(() => validateSecretBoundaries()).not.toThrow();
  });

  it("throws in production when a client-exposed secret is found", () => {
    process.env.NODE_ENV = "production";
    process.env.EXPO_PUBLIC_DATABASE_URL = "leaked";

    expect(() => validateSecretBoundaries()).toThrow(
      /SECRET BOUNDARY VIOLATION|Application startup blocked/,
    );
  });
});

describe("safeOpenAiStatus", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("reports not enabled when key is missing", () => {
    delete process.env.OPENAI_API_KEY;
    const status = safeOpenAiStatus();
    expect(status.enabled).toBe(false);
    expect(status.keyConfigured).toBe(false);
  });

  it("reports enabled when key is present", () => {
    process.env.OPENAI_API_KEY = "sk-test";
    const status = safeOpenAiStatus();
    expect(status.enabled).toBe(true);
    expect(status.keyConfigured).toBe(true);
  });

  it("uses default model when OPENAI_MODEL is unset", () => {
    delete process.env.OPENAI_MODEL;
    expect(safeOpenAiStatus().model).toBe("gpt-4o");
  });
});
