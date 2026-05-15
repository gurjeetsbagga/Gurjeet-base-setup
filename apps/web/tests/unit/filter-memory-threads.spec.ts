import { describe, expect, it } from "vitest";
import { filterMemoryThreads, sortMemoryThreads } from "@/lib/private-brain/filter-threads";
import { mockPrivateBrainData } from "@/lib/private-brain/mock-data";

describe("filterMemoryThreads", () => {
  it("filters by title", () => {
    const result = filterMemoryThreads(mockPrivateBrainData.threads, "Theresa");
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("Theresa");
  });

  it("sorts newest first by updated hours", () => {
    const sorted = sortMemoryThreads(mockPrivateBrainData.threads, "newest");
    expect(sorted[0]?.updatedHoursAgo).toBeLessThanOrEqual(sorted[1]?.updatedHoursAgo ?? 0);
  });
});
