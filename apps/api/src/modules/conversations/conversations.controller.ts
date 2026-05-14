import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { IdParamDto } from "../../common/dto";
import { THROTTLE_AI } from "../../common/throttle";
import { successResponse, paginatedSuccessResponse } from "../../shared/api-response";
import { ConversationsService } from "./conversations.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { QueryConversationsDto } from "./dto/query-conversations.dto";
import { MessageFeedbackDto } from "./dto/message-feedback.dto";

/**
 * Conversation endpoints — versioned under /api/v1/conversations.
 *
 * Orchestration flow:
 *   Client → Controller → ConversationsService → AiService → (AI provider)
 *
 * The controller is a thin HTTP adapter. All business logic and
 * orchestration lives in ConversationsService.
 */
@Controller("conversations")
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  /**
   * POST /conversations — start a new conversation.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser("id") userId: string, @Body() dto: CreateConversationDto) {
    const conversation = await this.conversationsService.create(userId, dto);
    return successResponse(conversation);
  }

  /**
   * GET /conversations — list user's conversations (paginated).
   */
  @Get()
  async findAll(@CurrentUser("id") userId: string, @Query() query: QueryConversationsDto) {
    const result = await this.conversationsService.findMany(userId, query);
    return paginatedSuccessResponse(result.data, result.total, result.page, result.pageSize);
  }

  /**
   * GET /conversations/:id — conversation details.
   */
  @Get(":id")
  async findOne(@CurrentUser("id") userId: string, @Param() { id }: IdParamDto) {
    const conversation = await this.conversationsService.findById(userId, id);
    return successResponse(conversation);
  }

  /**
   * DELETE /conversations/:id — archive a conversation.
   */
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async archive(@CurrentUser("id") userId: string, @Param() { id }: IdParamDto) {
    await this.conversationsService.archive(userId, id);
  }

  // ── Messages ─────────────────────────────────────────────

  /**
   * POST /conversations/:id/messages — send a message and get AI response.
   *
   * Rate-limited under the "ai" tier (stricter than global) because
   * each request triggers an AI completion with token costs.
   *
   * When `stream: true` is passed, this endpoint will eventually
   * return a text/event-stream response. For now it returns JSON.
   */
  @Throttle({ [THROTTLE_AI]: {} })
  @Post(":id/messages")
  async sendMessage(
    @CurrentUser("id") userId: string,
    @Param() { id }: IdParamDto,
    @Body() dto: SendMessageDto,
  ) {
    const message = await this.conversationsService.sendMessage(userId, id, dto);
    return successResponse(message);
  }

  /**
   * GET /conversations/:id/messages — full message history.
   */
  @Get(":id/messages")
  async getMessages(@CurrentUser("id") userId: string, @Param() { id }: IdParamDto) {
    const messages = await this.conversationsService.getMessages(userId, id);
    return successResponse(messages);
  }

  /**
   * PATCH /conversations/:id/messages/:messageId/feedback — rate an AI response.
   */
  @Patch(":id/messages/:messageId/feedback")
  @HttpCode(HttpStatus.NO_CONTENT)
  async submitFeedback(
    @CurrentUser("id") userId: string,
    @Param() { id }: IdParamDto,
    @Param("messageId") messageId: string,
    @Body() dto: MessageFeedbackDto,
  ) {
    await this.conversationsService.submitFeedback(userId, id, messageId, dto);
  }
}
