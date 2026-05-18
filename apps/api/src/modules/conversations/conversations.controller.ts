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
  Res,
} from "@nestjs/common";
import type { Response } from "express";
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

@Controller("conversations")
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser("id") userId: string, @Body() dto: CreateConversationDto) {
    const conversation = await this.conversationsService.create(userId, dto);
    return successResponse(conversation);
  }

  @Get()
  async findAll(@CurrentUser("id") userId: string, @Query() query: QueryConversationsDto) {
    const result = await this.conversationsService.findMany(userId, query);
    return paginatedSuccessResponse(result.data, result.total, result.page, result.pageSize);
  }

  @Get(":id")
  async findOne(@CurrentUser("id") userId: string, @Param() { id }: IdParamDto) {
    const conversation = await this.conversationsService.findById(userId, id);
    return successResponse(conversation);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async archive(@CurrentUser("id") userId: string, @Param() { id }: IdParamDto) {
    await this.conversationsService.archive(userId, id);
  }

  @Throttle({ [THROTTLE_AI]: {} })
  @Post(":id/messages")
  async sendMessage(
    @CurrentUser("id") userId: string,
    @Param() { id }: IdParamDto,
    @Body() dto: SendMessageDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (dto.stream) {
      res.status(200);
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      const flushable = res as Response & { flush?: () => void };
      try {
        for await (const event of this.conversationsService.streamMessage(userId, id, dto)) {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
          flushable.flush?.();
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Stream failed";
        res.write(`data: ${JSON.stringify({ type: "error", error: message })}\n\n`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    const message = await this.conversationsService.sendMessage(userId, id, dto);
    return successResponse(message);
  }

  @Get(":id/messages")
  async getMessages(@CurrentUser("id") userId: string, @Param() { id }: IdParamDto) {
    const messages = await this.conversationsService.getMessages(userId, id);
    return successResponse(messages);
  }

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
