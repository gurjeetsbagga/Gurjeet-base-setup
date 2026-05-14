import type { MemoryEntryType } from "@prisma/client";

/**
 * Application-layer memory entry returned to clients and
 * used internally by the orchestration layer.
 */
export interface MemoryEntryView {
  id: string;
  type: MemoryEntryType;
  content: string;
  sourceType: string | null;
  sourceId: string | null;
  metadata: MemoryMetadata;
  importance: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Structured metadata stored on memory entries.
 * Used for filtering, ranking, and AI context assembly.
 */
export interface MemoryMetadata {
  /** Topics extracted from the source content */
  topics?: string[];
  /** Emotional sentiment of the source content */
  sentiment?: "positive" | "neutral" | "negative" | "mixed";
  /** Intent category from AI analysis */
  intentCategory?: string;
  /** Conversation title (for CONVERSATION_SUMMARY entries) */
  conversationTitle?: string;
  /** Number of messages in the source conversation */
  messageCount?: number;
}
