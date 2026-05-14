import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type {
  MemoryRetriever,
  MemorySearchParams,
  MemorySearchResult,
  MemoryEntryView,
  MemoryMetadata,
} from "./interfaces";
import type { Prisma } from "@prisma/client";

/**
 * Keyword-based memory retriever — works with standard PostgreSQL
 * full-text search, no pgvector required.
 *
 * This is the default retriever until pgvector is enabled.
 * It uses PostgreSQL's `ILIKE` for simple keyword matching
 * and ranks results by importance score.
 *
 * When pgvector is available, the SemanticRetriever will replace
 * this as the primary strategy and this becomes the fallback
 * in a hybrid retrieval chain.
 */
@Injectable()
export class KeywordRetriever implements MemoryRetriever {
  readonly strategy = "keyword" as const;
  private readonly logger = new Logger(KeywordRetriever.name);

  constructor(private readonly prisma: PrismaService) {}

  async search(params: MemorySearchParams): Promise<MemorySearchResult[]> {
    const limit = params.limit ?? 10;
    const words = params.query
      .split(/\s+/)
      .filter((w) => w.length >= 2)
      .slice(0, 10);

    if (words.length === 0) return [];

    const where: Prisma.MemoryEntryWhereInput = {
      userId: params.userId,
      isActive: true,
      ...(params.minImportance !== undefined && {
        importance: { gte: params.minImportance },
      }),
      ...(params.types &&
        params.types.length > 0 && {
          type: { in: params.types as Prisma.EnumMemoryEntryTypeFilter["in"] },
        }),
      ...(params.after && { createdAt: { gte: params.after } }),
      OR: words.map((word) => ({
        content: { contains: word, mode: "insensitive" as const },
      })),
    };

    const entries = await this.prisma.memoryEntry.findMany({
      where,
      orderBy: [{ importance: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

    return entries.map((entry) => ({
      entry: toEntryView(entry),
      score: computeKeywordScore(entry.content, words, entry.importance),
      matchedBy: this.strategy,
    }));
  }
}

function computeKeywordScore(content: string, words: string[], importance: number): number {
  const lower = content.toLowerCase();
  const matchCount = words.filter((w) => lower.includes(w.toLowerCase())).length;
  const matchRatio = matchCount / words.length;
  return Math.min(matchRatio * 0.7 + importance * 0.3, 1.0);
}

function toEntryView(row: {
  id: string;
  type: string;
  content: string;
  sourceType: string | null;
  sourceId: string | null;
  metadata: unknown;
  importance: number;
  createdAt: Date;
  updatedAt: Date;
}): MemoryEntryView {
  return {
    id: row.id,
    type: row.type as MemoryEntryView["type"],
    content: row.content,
    sourceType: row.sourceType,
    sourceId: row.sourceId,
    metadata: (row.metadata ?? {}) as MemoryMetadata,
    importance: row.importance,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
