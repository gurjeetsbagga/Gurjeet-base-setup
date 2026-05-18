import { describe, expect, it } from "vitest";
import {
  isSensitiveKey,
  redactSensitive,
  summarizeAiMessages,
  truncateForLog,
} from "@/common/logger/redact.util";

describe("redact.util", () => {
  it("detects sensitive keys", () => {
    expect(isSensitiveKey("password")).toBe(true);
    expect(isSensitiveKey("authorization")).toBe(true);
    expect(isSensitiveKey("displayName")).toBe(false);
  });

  it("redacts nested sensitive fields", () => {
    const result = redactSensitive({
      email: "user@auryn.app",
      password: "secret",
      nested: { apiKey: "sk-test" },
    });

    expect(result).toEqual({
      email: "user@auryn.app",
      password: "[REDACTED]",
      nested: { apiKey: "[REDACTED]" },
    });
  });

  it("truncates long text more aggressively in production", () => {
    const text = "a".repeat(300);
    expect(truncateForLog(text, true).length).toBeLessThan(150);
    expect(truncateForLog(text, false).length).toBeGreaterThan(150);
  });

  it("omits AI content previews when disabled", () => {
    const summary = summarizeAiMessages(
      [{ role: "user", content: "I have knee pain after surgery" }],
      { includePreview: false, isProduction: true },
    );

    expect(summary[0]?.contentPreview).toBeUndefined();
    expect(summary[0]?.contentLength).toBeGreaterThan(0);
  });
});
