import type { MemoryEntryView } from "./memory-entry.interface";

/**
 * Contract for memory retrieval strategies.
 *
 * The MemoryService uses this interface to retrieve relevant
 * memories for AI context assembly. This abstraction allows:
 *   - Keyword-based retrieval (current, no pgvector needed)
 *   - Semantic vector retrieval (future, requires pgvector)
 *   - Hybrid retrieval (keyword + vector combined)
 *
 * Implementations never call AI or write to the database —
 * they are pure retrieval operations.
 */
export interface MemoryRetriever {
  readonly strategy: RetrievalStrategy;

  /**
   * Search for memories relevant to a query.
   * Returns ranked results with relevance scores.
   */
  search(params: MemorySearchParams): Promise<MemorySearchResult[]>;
}

export type RetrievalStrategy = "keyword" | "semantic" | "hybrid";

export interface MemorySearchParams {
  userId: string;
  query: string;
  /** Max results to return */
  limit?: number;
  /** Filter by memory entry types */
  types?: string[];
  /** Minimum importance threshold (0.0–1.0) */
  minImportance?: number;
  /** Only return memories created after this date */
  after?: Date;
}

export interface MemorySearchResult {
  entry: MemoryEntryView;
  /** Relevance score (0.0–1.0), higher is more relevant */
  score: number;
  /** Which strategy produced this result */
  matchedBy: RetrievalStrategy;
}

/**
 * Context payload assembled from memory for AI prompt injection.
 * The orchestration layer injects this into SystemPromptContext.memorySummary.
 */
export interface MemoryContext {
  /** Pre-formatted summary string ready for system prompt injection */
  summary: string;
  /** Number of memory entries that contributed to the summary */
  entryCount: number;
  /** Retrieval strategy used */
  strategy: RetrievalStrategy;
}

/** DI token for injecting the active retriever */
export const MEMORY_RETRIEVER = Symbol("MEMORY_RETRIEVER");
