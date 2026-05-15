import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatRelativeTime } from "@/lib/utils";

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats recent minutes", () => {
    const fiveMinAgo = new Date("2026-05-15T11:55:00Z");
    expect(formatRelativeTime(fiveMinAgo)).toBe("5m ago");
  });

  it("formats same day hours", () => {
    const twoHoursAgo = new Date("2026-05-15T10:00:00Z");
    expect(formatRelativeTime(twoHoursAgo)).toBe("2h ago");
  });
});
