import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { IdParamDto } from "../../common/dto";
import { successResponse, paginatedSuccessResponse } from "../../shared/api-response";
import { MemoryService } from "./memory.service";
import { StoreMemoryDto } from "./dto/store-memory.dto";
import { QueryMemoriesDto } from "./dto/query-memories.dto";
import { SearchMemoryDto } from "./dto/search-memory.dto";

/**
 * Memory (Private Brain) endpoints — /api/v1/memory.
 *
 * Provides CRUD for memory entries and semantic search.
 * All operations are scoped to the authenticated user.
 */
@Controller("memory")
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  /**
   * POST /memory — store a new memory entry.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async store(@CurrentUser("id") userId: string, @Body() dto: StoreMemoryDto) {
    const entry = await this.memoryService.store(userId, dto);
    return successResponse(entry);
  }

  /**
   * GET /memory — list user's memory entries (paginated).
   */
  @Get()
  async findAll(@CurrentUser("id") userId: string, @Query() query: QueryMemoriesDto) {
    const result = await this.memoryService.findMany(userId, query);
    return paginatedSuccessResponse(result.data, result.total, result.page, result.pageSize);
  }

  /**
   * POST /memory/search — search memories by relevance.
   * Uses POST because the search body can be complex.
   */
  @Post("search")
  @HttpCode(HttpStatus.OK)
  async search(@CurrentUser("id") userId: string, @Body() dto: SearchMemoryDto) {
    const results = await this.memoryService.search(userId, dto);
    return successResponse(results);
  }

  /**
   * GET /memory/:id — single memory entry.
   */
  @Get(":id")
  async findOne(@CurrentUser("id") userId: string, @Param() { id }: IdParamDto) {
    const entry = await this.memoryService.findById(userId, id);
    return successResponse(entry);
  }

  /**
   * DELETE /memory/:id — soft-delete a memory entry.
   */
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivate(@CurrentUser("id") userId: string, @Param() { id }: IdParamDto) {
    await this.memoryService.deactivate(userId, id);
  }
}
