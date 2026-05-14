import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { normalizePagination, paginatedResponse } from "../../shared/pagination";
import type { StoreMemoryDto } from "./dto/store-memory.dto";
import type { QueryMemoriesDto } from "./dto/query-memories.dto";
import type { SearchMemoryDto } from "./dto/search-memory.dto";
import type {
  MemoryRetriever,
  MemoryEntryView,
  MemoryMetadata,
  MemoryContext,
  MemorySearchResult,
} from "./interfaces";
import { MEMORY_RETRIEVER } from "./interfaces";

/**
 * Private Brain memory service.
 *
 * Manages the storage, retrieval, and assembly of user memories
 * for AI context personalization. This is the core of Auryn's
 * "Private Brain" — the accumulated knowledge about each user.
 *
 * Data flow:
 *   Store:    ConversationsService → MemoryService.store() → Prisma
 *   Retrieve: AiService → MemoryService.buildContext() → system prompt
 *
 * The service NEVER calls AI directly. Embedding generation
 * and topic extraction happen upstream (in the conversations
 * orchestration flow) and are passed in as structured data.
 */
@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(MEMORY_RETRIEVER)
    private readonly retriever: MemoryRetriever,
  ) {
    this.logger.log(`Memory retriever: ${this.retriever.strategy}`);
  }

  // ── Store ────────────────────────────────────────────────

  async store(userId: string, dto: StoreMemoryDto): Promise<MemoryEntryView> {
    const entry = await this.prisma.memoryEntry.create({
      data: {
        userId,
        type: dto.type,
        content: dto.content,
        sourceType: dto.sourceType,
        sourceId: dto.sourceId,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
        importance: dto.importance ?? 0.5,
      },
    });

    this.logger.debug(`Memory stored: ${entry.id} type=${entry.type} user=${userId}`);

    return this.toEntryView(entry);
  }

  /**
   * Store a conversation summary as a memory entry.
   * Called by the conversations orchestration after a conversation
   * reaches a meaningful length.
   */
  async storeConversationSummary(
    userId: string,
    conversationId: string,
    summary: string,
    metadata: MemoryMetadata,
  ): Promise<MemoryEntryView> {
    return this.store(userId, {
      type: "CONVERSATION_SUMMARY",
      content: summary,
      sourceType: "conversation",
      sourceId: conversationId,
      metadata: metadata as Record<string, unknown>,
      importance: 0.7,
    });
  }

  // ── Retrieve ─────────────────────────────────────────────

  async findById(userId: string, id: string): Promise<MemoryEntryView> {
    const entry = await this.prisma.memoryEntry.findUnique({
      where: { id },
    });

    if (!entry || entry.userId !== userId) {
      throw new NotFoundException("Memory entry not found");
    }

    return this.toEntryView(entry);
  }

  async findMany(userId: string, query: QueryMemoriesDto) {
    const { skip, take, page, pageSize } = normalizePagination(query);

    const where: Prisma.MemoryEntryWhereInput = {
      userId,
      isActive: true,
      ...(query.type && { type: query.type }),
      ...(query.sourceType && { sourceType: query.sourceType }),
    };

    const [entries, total] = await this.prisma.$transaction([
      this.prisma.memoryEntry.findMany({
        where,
        skip,
        take,
        orderBy: [{ importance: "desc" }, { createdAt: "desc" }],
      }),
      this.prisma.memoryEntry.count({ where }),
    ]);

    return paginatedResponse(
      entries.map((e) => this.toEntryView(e)),
      total,
      page,
      pageSize,
    );
  }

  /**
   * Semantic / keyword search over the user's memories.
   * Delegates to the active MemoryRetriever implementation.
   */
  async search(userId: string, dto: SearchMemoryDto): Promise<MemorySearchResult[]> {
    return this.retriever.search({
      userId,
      query: dto.query,
      limit: dto.limit,
      types: dto.type ? [dto.type] : undefined,
      minImportance: dto.minImportance,
    });
  }

  /**
   * Build a memory context string for AI system prompt injection.
   *
   * This is the bridge between Private Brain and the AI:
   *   MemoryService.buildContext() → SystemPromptContext.memorySummary
   *
   * Retrieves the most relevant memories for a given query
   * (typically the user's latest message) and formats them
   * into a concise context block.
   */
  async buildContext(userId: string, query: string, limit = 5): Promise<MemoryContext> {
    const results = await this.retriever.search({
      userId,
      query,
      limit,
      minImportance: 0.3,
    });

    if (results.length === 0) {
      return {
        summary: "",
        entryCount: 0,
        strategy: this.retriever.strategy,
      };
    }

    const summaryParts = results.map((r, i) => {
      const typeLabel = formatEntryType(r.entry.type);
      return `[${i + 1}] ${typeLabel}: ${truncate(r.entry.content, 300)}`;
    });

    return {
      summary: summaryParts.join("\n"),
      entryCount: results.length,
      strategy: this.retriever.strategy,
    };
  }

  // ── Lifecycle ────────────────────────────────────────────

  /**
   * Soft-delete a memory entry.
   */
  async deactivate(userId: string, id: string): Promise<void> {
    const entry = await this.prisma.memoryEntry.findUnique({
      where: { id },
    });

    if (!entry || entry.userId !== userId) {
      throw new NotFoundException("Memory entry not found");
    }

    await this.prisma.memoryEntry.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.debug(`Memory deactivated: ${id}`);
  }

  // ── Helpers ──────────────────────────────────────────────

  private toEntryView(row: {
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
}

function formatEntryType(type: string): string {
  const labels: Record<string, string> = {
    CONVERSATION_SUMMARY: "Conversation",
    TOPIC_EXTRACTION: "Topic",
    USER_PREFERENCE: "Preference",
    HEALTH_INSIGHT: "Health",
    RECOVERY_NOTE: "Recovery",
    CUSTOM: "Note",
  };
  return labels[type] ?? type;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
