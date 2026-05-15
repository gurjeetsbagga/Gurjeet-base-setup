import type { MemoryCategory } from "./types";

export interface MemoryCategoryStyle {
  label: string;
  indicatorClass: string;
}

/** Semantic category tokens — mapped in globals.css @theme */
export const MEMORY_CATEGORY_STYLES: Record<MemoryCategory, MemoryCategoryStyle> = {
  goal: { label: "Goal", indicatorClass: "bg-memory-goal" },
  health: { label: "Health", indicatorClass: "bg-memory-health" },
  personal: { label: "Personal", indicatorClass: "bg-memory-personal" },
  research: { label: "Research", indicatorClass: "bg-memory-research" },
  sleep: { label: "Sleep", indicatorClass: "bg-memory-sleep" },
  family: { label: "Family", indicatorClass: "bg-memory-family" },
};

export function formatMemoryMeta(thread: {
  category: MemoryCategory;
  status: string;
  updatedHoursAgo: number;
  insightCount: number;
}): string {
  const categoryLabel = MEMORY_CATEGORY_STYLES[thread.category].label;
  const statusLabel = thread.status.charAt(0).toUpperCase() + thread.status.slice(1);
  const hours = thread.updatedHoursAgo === 1 ? "1h" : `${thread.updatedHoursAgo}h`;
  const insights = thread.insightCount === 1 ? "1 insight" : `${thread.insightCount} insights`;
  return `${categoryLabel} · ${statusLabel} · Updated ${hours} ago · ${insights}`;
}
