import { describe, expect, it } from "vitest";
import { generateResetToken, hashResetToken } from "./reset-token.util";

describe("reset-token.util", () => {
  it("hashes tokens consistently", () => {
    const raw = "test-token-value";
    expect(hashResetToken(raw)).toBe(hashResetToken(raw));
    expect(hashResetToken(raw)).not.toBe(hashResetToken("other"));
  });

  it("generates unique tokens", () => {
    const a = generateResetToken();
    const b = generateResetToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(20);
  });
});
