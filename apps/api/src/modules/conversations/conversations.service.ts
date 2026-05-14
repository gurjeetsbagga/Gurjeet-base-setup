import { ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { normalizePagination, paginatedResponse } from "../../shared/pagination";
import { AiService } from "../ai/ai.service";
import type { CreateConversationDto } from "./dto/create-conversation.dto";
import type { SendMessageDto } from "./dto/send-message.dto";
import type { QueryConversationsDto } from "./dto/query-conversations.dto";
import type { MessageFeedbackDto } from "./dto/message-feedback.dto";
import type {
  ConversationView,
  ConversationMetadata,
  MessageView,
  MessageMetadata,
  AiMessage,
} from "./interfaces";

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  // ── Conversation CRUD ────────────────────────────────────

  async create(userId: string, dto: CreateConversationDto): Promise<ConversationView> {
    const metadata: ConversationMetadata = {};
    if (dto.source) metadata.source = dto.source;

    const conversation = await this.prisma.conversation.create({
      data: {
        userId,
        title: dto.title,
        model: dto.model,
        metadata: metadata as Prisma.InputJsonValue,
      },
    });

    this.logger.log(`Conversation created: ${conversation.id} by user ${userId}`);

    if (dto.initialMessage) {
      await this.sendMessage(userId, conversation.id, {
        message: dto.initialMessage,
      });
    }

    return this.toConversationView(
      await this.prisma.conversation.findUniqueOrThrow({
        where: { id: conversation.id },
      }),
    );
  }

  async findById(userId: string, conversationId: string): Promise<ConversationView> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) throw new NotFoundException("Conversation not found");
    if (conversation.userId !== userId) throw new ForbiddenException("Access denied");

    return this.toConversationView(conversation);
  }

  async findMany(userId: string, query: QueryConversationsDto) {
    const { skip, take, page, pageSize } = normalizePagination(query);

    const where: Prisma.ConversationWhereInput = {
      userId,
      status: query.status ?? "ACTIVE",
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: "insensitive" as const } },
          { summary: { contains: query.search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [conversations, total] = await this.prisma.$transaction([
      this.prisma.conversation.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: "desc" },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return paginatedResponse(
      conversations.map((c) => this.toConversationView(c)),
      total,
      page,
      pageSize,
    );
  }

  async archive(userId: string, conversationId: string): Promise<void> {
    const conversation = await this.ensureOwnership(userId, conversationId);

    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { status: "ARCHIVED" },
    });

    this.logger.log(`Conversation archived: ${conversationId}`);
  }

  // ── Message operations ───────────────────────────────────

  /**
   * Core orchestration flow:
   *   1. Persist the user message
   *   2. Load conversation history (trimmed for context window)
   *   3. Call AiService boundary for completion
   *   4. Persist the assistant response
   *   5. Update conversation metadata
   *   6. Return the assistant message
   */
  async sendMessage(
    userId: string,
    conversationId: string,
    dto: SendMessageDto,
  ): Promise<MessageView> {
    await this.ensureOwnership(userId, conversationId);

    await this.prisma.message.create({
      data: {
        conversationId,
        userId,
        role: "USER",
        status: "COMPLETED",
        content: dto.message,
      },
    });

    const history = await this.loadHistory(conversationId);

    const aiResponse = await this.ai.complete({
      messages: history,
      userId,
      conversationId,
    });

    const assistantMessage = await this.prisma.message.create({
      data: {
        conversationId,
        role: "ASSISTANT",
        status: "COMPLETED",
        content: aiResponse.content,
        tokenCount: aiResponse.tokenCount.total,
        metadata: aiResponse.metadata as Prisma.InputJsonValue,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        messageCount: { increment: 2 },
        lastMessageAt: new Date(),
      },
    });

    return this.toMessageView(assistantMessage);
  }

  async getMessages(userId: string, conversationId: string): Promise<MessageView[]> {
    await this.ensureOwnership(userId, conversationId);

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    return messages.map((m) => this.toMessageView(m));
  }

  async submitFeedback(
    userId: string,
    conversationId: string,
    messageId: string,
    dto: MessageFeedbackDto,
  ): Promise<void> {
    await this.ensureOwnership(userId, conversationId);

    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.conversationId !== conversationId) {
      throw new NotFoundException("Message not found");
    }

    if (message.role !== "ASSISTANT") {
      throw new ForbiddenException("Feedback can only be given on assistant messages");
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        feedbackRating: dto.rating,
        feedbackComment: dto.comment,
      },
    });

    this.logger.log(`Feedback submitted for message ${messageId}: ${dto.rating}`);
  }

  // ── Helpers ──────────────────────────────────────────────

  /**
   * Load conversation history formatted for the AI boundary.
   * Limits to most recent messages to respect context window.
   */
  private async loadHistory(conversationId: string, limit = 50): Promise<AiMessage[]> {
    const messages = await this.prisma.message.findMany({
      where: { conversationId, status: "COMPLETED" },
      orderBy: { createdAt: "asc" },
      take: limit,
      select: { role: true, content: true },
    });

    return messages.map((m) => ({
      role: m.role.toLowerCase() as AiMessage["role"],
      content: m.content,
    }));
  }

  private async ensureOwnership(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) throw new NotFoundException("Conversation not found");
    if (conversation.userId !== userId) throw new ForbiddenException("Access denied");

    return conversation;
  }

  private toConversationView(row: {
    id: string;
    title: string | null;
    status: string;
    model: string | null;
    summary: string | null;
    messageCount: number;
    lastMessageAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): ConversationView {
    return {
      id: row.id,
      title: row.title,
      status: row.status as ConversationView["status"],
      model: row.model,
      summary: row.summary,
      messageCount: row.messageCount,
      lastMessageAt: row.lastMessageAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toMessageView(row: {
    id: string;
    role: string;
    status: string;
    content: string;
    tokenCount: number | null;
    metadata: unknown;
    feedbackRating: string | null;
    createdAt: Date;
  }): MessageView {
    return {
      id: row.id,
      role: row.role as MessageView["role"],
      status: row.status as MessageView["status"],
      content: row.content,
      tokenCount: row.tokenCount,
      metadata: (row.metadata ?? {}) as MessageMetadata,
      feedbackRating: row.feedbackRating,
      createdAt: row.createdAt,
    };
  }
}
