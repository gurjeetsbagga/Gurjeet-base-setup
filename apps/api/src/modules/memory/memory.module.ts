import { Module } from "@nestjs/common";
import { MemoryController } from "./memory.controller";
import { MemoryService } from "./memory.service";
import { KeywordRetriever } from "./keyword-retriever";
import { MEMORY_RETRIEVER } from "./interfaces";

/**
 * Private Brain memory module.
 *
 * Retriever selection:
 *   - Default: KeywordRetriever (PostgreSQL ILIKE, no extensions needed)
 *   - Future:  SemanticRetriever (pgvector cosine similarity)
 *   - Future:  HybridRetriever  (keyword + semantic combined)
 *
 * When pgvector is available, swap the MEMORY_RETRIEVER provider
 * to use a factory that selects based on config (similar to AI_PROVIDER).
 */
@Module({
  controllers: [MemoryController],
  providers: [
    MemoryService,
    KeywordRetriever,
    {
      provide: MEMORY_RETRIEVER,
      useExisting: KeywordRetriever,
    },
  ],
  exports: [MemoryService],
})
export class MemoryModule {}
