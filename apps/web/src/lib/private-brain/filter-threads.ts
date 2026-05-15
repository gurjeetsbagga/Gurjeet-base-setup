import type { MemorySortOption, MemoryThread } from "./types";

export function filterMemoryThreads(threads: MemoryThread[], query: string): MemoryThread[] {
  const q = query.trim().toLowerCase();
  if (!q) return threads;
  return threads.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q),
  );
}

export function sortMemoryThreads(threads: MemoryThread[], sort: MemorySortOption): MemoryThread[] {
  const copy = [...threads];
  switch (sort) {
    case "oldest":
      return copy.sort((a, b) => b.updatedHoursAgo - a.updatedHoursAgo);
    case "importance":
      return copy.sort((a, b) => b.insightCount - a.insightCount);
    case "relevance":
      return copy;
    case "newest":
    default:
      return copy.sort((a, b) => a.updatedHoursAgo - b.updatedHoursAgo);
  }
}
