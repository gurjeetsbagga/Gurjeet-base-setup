import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { normalizePagination, paginatedResponse } from "../../shared/pagination";
import { AiOrchestrationService } from "../ai/ai-orchestration.service";
import { InstructionSnapshotService } from "../ai/prompts/instruction-snapshot.service";
import { MemoryService } from "../memory/memory.service";
import { instructionAuditFields, mergeMessageMetadata } from "./utils/instruction-audit.util";
import type { CreateConversationDto } from "./dto/create-conversation.dto";
import type { SendMessageDto } from "./dto/send-message.dto";
import type { QueryConversationsDto } from "./dto/query-conversations.dto";
import type { MessageFeedbackDto } from "./dto/message-feedback.dto";
import { PromptContextBuilder } from "./prompt-context.builder";
import type {
  ConversationView,
  ConversationMetadata,
  MessageView,
  MessageMetadata,
  AiMessage,
} from "./interfaces";

export interface StreamMessageEvent {
  type: "chunk" | "done" | "error";
  delta?: string;
  message?: MessageView;
  error?: string;
}

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiOrchestrationService,
    private readonly instructionSnapshot: InstructionSnapshotService,
    private readonly promptContext: PromptContextBuilder,
    private readonly memory: MemoryService,
  ) {}

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
      await this.sendMessage(userId, conversation.id, { message: dto.initialMessage });
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

  /**
   * Synchronous orchestration: persist user message → AI → persist assistant message.
   */
  async sendMessage(
    userId: string,
    conversationId: string,
    dto: SendMessageDto,
  ): Promise<MessageView> {
    if (dto.stream) {
      throw new BadRequestException("Use stream=true on POST messages for SSE responses");
    }

    await this.ensureOwnership(userId, conversationId);

    const snapshot = await this.instructionSnapshot.resolveActiveSnapshot();
    const audit = instructionAuditFields(snapshot);

    await this.prisma.message.create({
      data: {
        conversationId,
        userId,
        role: "USER",
        status: "COMPLETED",
        content: dto.message,
        instructionVersionId: audit.instructionVersionId,
        metadata: audit.metadata,
      },
    });

    const history = await this.loadHistory(conversationId);
    const promptCtx = await this.promptContext.build(userId, dto.message, {
      recoveryContext: dto.context,
    });

    const aiResponse = await this.ai.complete(
      {
        messages: history,
        userId,
        conversationId,
        model: undefined,
        instructionSnapshot: snapshot,
      },
      promptCtx,
      { instructionSnapshot: snapshot },
    );

    let metadata = mergeMessageMetadata(aiResponse.metadata as MessageMetadata, snapshot);

    const assistantMessage = await this.persistAssistantMessage(
      conversationId,
      aiResponse.content,
      aiResponse.tokenCount.total,
      metadata,
      snapshot,
    );

    metadata = await this.ai.finalizeProposedActions(
      userId,
      conversationId,
      assistantMessage.id,
      metadata,
    );

    if (metadata.proposedActionIds?.length) {
      await this.prisma.message.update({
        where: { id: assistantMessage.id },
        data: { metadata: metadata as Prisma.InputJsonValue },
      });
    }

    await this.afterAssistantResponse(userId, conversationId, dto.message, aiResponse.content);

    return this.toMessageView({
      ...assistantMessage,
      metadata,
    });
  }

  /**
   * Streaming orchestration — yields SSE-compatible events.
   */
  async *streamMessage(
    userId: string,
    conversationId: string,
    dto: SendMessageDto,
  ): AsyncGenerator<StreamMessageEvent> {
    let assistantRow: { id: string } | null = null;
    let assembled = "";

    try {
      await this.ensureOwnership(userId, conversationId);

      const snapshot = await this.instructionSnapshot.resolveActiveSnapshot();
      const audit = instructionAuditFields(snapshot);

      await this.prisma.message.create({
        data: {
          conversationId,
          userId,
          role: "USER",
          status: "COMPLETED",
          content: dto.message,
          instructionVersionId: audit.instructionVersionId,
          metadata: audit.metadata,
        },
      });

      const history = await this.loadHistory(conversationId);
      const promptCtx = await this.promptContext.build(userId, dto.message, {
        recoveryContext: dto.context,
      });

      assistantRow = await this.prisma.message.create({
        data: {
          conversationId,
          role: "ASSISTANT",
          status: "STREAMING",
          content: "",
          instructionVersionId: audit.instructionVersionId,
          metadata: audit.metadata,
        },
      });

      for await (const chunk of this.ai.stream(
        { messages: history, userId, conversationId, instructionSnapshot: snapshot },
        promptCtx,
        { instructionSnapshot: snapshot },
      )) {
        if (!chunk.done) {
          assembled += chunk.delta;
          yield { type: "chunk", delta: chunk.delta };
        } else {
          if (chunk.delta) assembled += chunk.delta;

          const streamMeta = mergeMessageMetadata(
            {
              model: this.ai.providerName,
            },
            snapshot,
          );

          const updated = await this.prisma.message.update({
            where: { id: assistantRow.id },
            data: {
              content: assembled,
              status: "COMPLETED",
              tokenCount: chunk.usage?.total ?? null,
              metadata: streamMeta as Prisma.InputJsonValue,
            },
          });

          await this.prisma.conversation.update({
            where: { id: conversationId },
            data: {
              messageCount: { increment: 2 },
              lastMessageAt: new Date(),
            },
          });

          await this.afterAssistantResponse(userId, conversationId, dto.message, assembled);

          yield {
            type: "done",
            message: this.toMessageView(updated),
          };
        }
      }
    } catch (error: unknown) {
      const message = formatStreamError(error);
      if (assistantRow) {
        try {
          await this.prisma.message.update({
            where: { id: assistantRow.id },
            data: { status: "FAILED", content: assembled || message },
          });
        } catch {
          /* non-blocking */
        }
      }
      yield { type: "error", error: message };
    }
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
  }

  /** Memory note + rolling conversation summary on profile (Step 1). */
  private async afterAssistantResponse(
    userId: string,
    conversationId: string,
    userMessage: string,
    assistantContent: string,
  ): Promise<void> {
    try {
      await this.memory.store(userId, {
        type: "CONVERSATION_SUMMARY",
        content: `User: ${truncate(userMessage, 200)}\nAssistant: ${truncate(assistantContent, 400)}`,
        sourceType: "conversation",
        sourceId: conversationId,
        metadata: { conversationId },
        importance: 0.4,
      });
    } catch {
      /* non-blocking */
    }

    try {
      await this.refreshConversationSummary(userId, conversationId);
    } catch {
      /* non-blocking */
    }
  }

  private async refreshConversationSummary(userId: string, conversationId: string): Promise<void> {
    const recent = await this.prisma.message.findMany({
      where: { conversationId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { role: true, content: true },
    });

    if (recent.length === 0) return;

    const summary = recent
      .reverse()
      .map((m) => `${m.role === "USER" ? "User" : "Auryn"}: ${truncate(m.content, 220)}`)
      .join("\n");

    const clipped = truncate(summary, 4000);

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { summary: clipped },
    });

    await this.prisma.userProfile.updateMany({
      where: { userId },
      data: { conversationSummary: clipped },
    });
  }

  private async persistAssistantMessage(
    conversationId: string,
    content: string,
    tokenCount: number,
    metadata: MessageMetadata,
    snapshot: Awaited<ReturnType<InstructionSnapshotService["resolveActiveSnapshot"]>>,
  ) {
    const audit = instructionAuditFields(snapshot);

    const assistantMessage = await this.prisma.message.create({
      data: {
        conversationId,
        role: "ASSISTANT",
        status: "COMPLETED",
        content,
        tokenCount,
        instructionVersionId: audit.instructionVersionId,
        metadata: metadata as Prisma.InputJsonValue,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        messageCount: { increment: 2 },
        lastMessageAt: new Date(),
      },
    });

    return assistantMessage;
  }

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
    instructionVersionId?: string | null;
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
      instructionVersionId: row.instructionVersionId ?? null,
      feedbackRating: row.feedbackRating,
      createdAt: row.createdAt,
    };
  }
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

function formatStreamError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (/instruction_version_id|column .* does not exist|P2022/i.test(raw)) {
    return "Database schema is out of date. Run pnpm db:migrate:deploy from the repo root, then restart the API.";
  }
  return raw || "Stream failed";
}
