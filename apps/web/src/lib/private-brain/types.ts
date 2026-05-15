export type MemoryCategory = "goal" | "health" | "personal" | "research" | "sleep" | "family";

export type MemoryThreadStatus = "active" | "paused" | "archived";

export type MemorySortOption = "newest" | "oldest" | "relevance" | "importance";

export interface MemoryThread {
  id: string;
  title: string;
  category: MemoryCategory;
  status: MemoryThreadStatus;
  updatedHoursAgo: number;
  insightCount: number;
}

export interface MemoryInsightContent {
  headline: string;
  body?: string;
}

export interface MemoryToolAction {
  id: string;
  label: string;
  description?: string;
  variant?: "default" | "destructive";
}

export interface PrivateBrainPageData {
  title: string;
  subtitle: string;
  threadCount: number;
  threads: MemoryThread[];
  insight: MemoryInsightContent;
  tools: MemoryToolAction[];
}
