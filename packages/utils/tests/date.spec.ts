import { describe, expect, it } from "vitest";
import { formatDate, toISOString } from "../src/date";

describe("formatDate", () => {
  it("formats a Date object with default options", () => {
    const result = formatDate(new Date("2025-01-15T00:00:00Z"));
    expect(result).toMatch(/Jan\s+15,\s+2025/);
  });

  it("formats an ISO string", () => {
    const result = formatDate("2025-06-01T12:00:00Z");
    expect(result).toMatch(/Jun\s+1,\s+2025/);
  });

  it("respects custom locale and options", () => {
    const result = formatDate(new Date("2025-03-20"), "de-DE", {
      year: "numeric",
      month: "long",
    });
    expect(result).toMatch(/März 2025/);
  });
});

describe("toISOString", () => {
  it("converts a Date to ISO string", () => {
    const d = new Date("2025-01-01T00:00:00.000Z");
    expect(toISOString(d)).toBe("2025-01-01T00:00:00.000Z");
  });

  it("converts a numeric timestamp", () => {
    const ts = new Date("2025-01-01T00:00:00.000Z").getTime();
    expect(toISOString(ts)).toBe("2025-01-01T00:00:00.000Z");
  });

  it("converts a string date", () => {
    expect(toISOString("2025-01-01")).toContain("2025-01-01");
  });
});
