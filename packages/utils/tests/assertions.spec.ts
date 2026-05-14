import { describe, expect, it } from "vitest";
import { invariant, assertNever } from "../src/assertions";

describe("invariant", () => {
  it("passes when condition is truthy", () => {
    expect(() => invariant(true, "ok")).not.toThrow();
    expect(() => invariant(1, "ok")).not.toThrow();
    expect(() => invariant("non-empty", "ok")).not.toThrow();
  });

  it("throws when condition is falsy", () => {
    expect(() => invariant(false, "boom")).toThrow("Invariant violation: boom");
    expect(() => invariant(null, "null")).toThrow("Invariant violation: null");
    expect(() => invariant(undefined, "undef")).toThrow("Invariant violation: undef");
    expect(() => invariant(0, "zero")).toThrow("Invariant violation: zero");
    expect(() => invariant("", "empty")).toThrow("Invariant violation: empty");
  });
});

describe("assertNever", () => {
  it("throws with default message", () => {
    expect(() => assertNever("unexpected" as never)).toThrow("Unexpected value: unexpected");
  });

  it("throws with custom message", () => {
    expect(() => assertNever("x" as never, "custom")).toThrow("custom");
  });
});
