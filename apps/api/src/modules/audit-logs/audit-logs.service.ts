import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { normalizePagination, paginatedResponse } from "../../shared/pagination";
import type {
  AuditEvent,
  AuditCategory,
  AuditActor,
  AuditTarget,
  AuditOutcome,
  AuditQueryFilters,
  AuditSummary,
} from "./interfaces";
import type { QueryAuditLogsDto } from "./dto/query-audit-logs.dto";

/**
 * Input for recording an audit event.
 * Callers provide this; the service adds id, timestamp, and persistence.
 */
export interface RecordAuditInput {
  category: AuditCategory;
  action: string;
  actor: AuditActor;
  target?: AuditTarget | null;
  outcome?: AuditOutcome;
  details?: Record<string, unknown>;
  requestId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Centralized audit logging service.
 *
 * All auditable operations across the platform flow through this service.
 * It persists events to the audit_logs table and provides structured
 * queries for admin dashboards, compliance, debugging, and moderation.
 *
 * Key properties:
 *   - Append-only: records are never modified after creation
 *   - Non-blocking: failures in audit logging never break the main flow
 *   - Structured: every event has category, action, actor, target, outcome
 *   - Traceable: requestId links events to HTTP requests
 *
 * Usage from any service:
 *   this.auditLogService.record({
 *     category: "ai",
 *     action: AuditActions.AI_GUARDRAIL_BLOCKED,
 *     actor: { type: "system", id: "ai-pipeline", label: "AI Pipeline" },
 *     target: { type: "message", id: messageId, label: null },
 *     details: { reason: "prompt_injection" },
 *     requestId,
 *   });
 */
@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Record ───────────────────────────────────────────────

  /**
   * Record an audit event.
   *
   * This method is intentionally fire-and-forget — it catches and logs
   * its own errors so audit failures never break the calling operation.
   */
  async record(input: RecordAuditInput): Promise<AuditEvent> {
    const event: AuditEvent = {
      id: randomUUID(),
      category: input.category,
      action: input.action,
      actor: input.actor,
      target: input.target ?? null,
      details: input.details ?? {},
      outcome: input.outcome ?? "success",
      requestId: input.requestId ?? null,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      createdAt: new Date(),
    };

    try {
      await this.prisma.auditLog.create({
        data: {
          id: event.id,
          category: event.category,
          action: event.action,
          actorType: event.actor.type,
          actorId: event.actor.id,
          actorLabel: event.actor.label,
          targetType: event.target?.type ?? null,
          targetId: event.target?.id ?? null,
          targetLabel: event.target?.label ?? null,
          outcome: event.outcome,
          details: event.details as Prisma.InputJsonValue,
          requestId: event.requestId,
          ip: event.ip,
          userAgent: event.userAgent,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to persist audit event [${event.action}]: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );

      this.logger.log({
        type: "audit_fallback",
        ...this.toLogEntry(event),
      });
    }

    return event;
  }

  /**
   * Record multiple audit events in a batch.
   * Uses a transaction for consistency.
   */
  async recordBatch(inputs: RecordAuditInput[]): Promise<void> {
    const creates = inputs.map((input) => {
      const id = randomUUID();
      return this.prisma.auditLog.create({
        data: {
          id,
          category: input.category,
          action: input.action,
          actorType: input.actor.type,
          actorId: input.actor.id,
          actorLabel: input.actor.label,
          targetType: input.target?.type ?? null,
          targetId: input.target?.id ?? null,
          targetLabel: input.target?.label ?? null,
          outcome: input.outcome ?? "success",
          details: (input.details ?? {}) as Prisma.InputJsonValue,
          requestId: input.requestId ?? null,
          ip: input.ip ?? null,
          userAgent: input.userAgent ?? null,
        },
      });
    });

    try {
      await this.prisma.$transaction(creates);
    } catch (error) {
      this.logger.error(
        `Failed to persist audit batch (${inputs.length} events): ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  // ── Query ────────────────────────────────────────────────

  /**
   * Query audit logs with filtering and pagination.
   * Used by admin endpoints for operational visibility.
   */
  async findMany(dto: QueryAuditLogsDto) {
    const { skip, take, page, pageSize } = normalizePagination(dto);
    const where = this.buildWhereClause(dto);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const events: AuditEvent[] = data.map((row) => this.toAuditEvent(row));

    return paginatedResponse(events, total, page, pageSize);
  }

  /**
   * Get a summary of audit events for a time window.
   */
  async getSummary(filters: AuditQueryFilters): Promise<AuditSummary> {
    const where = this.buildWhereClause(filters);

    const [totalEvents, byCategory, byOutcome] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.groupBy({
        by: ["category"],
        where,
        _count: true,
      }),
      this.prisma.auditLog.groupBy({
        by: ["outcome"],
        where,
        _count: true,
      }),
    ]);

    return {
      totalEvents,
      byCategory: Object.fromEntries(byCategory.map((g) => [g.category, g._count])),
      byOutcome: Object.fromEntries(byOutcome.map((g) => [g.outcome, g._count])),
      period: {
        start: filters.startDate ?? new Date(0),
        end: filters.endDate ?? new Date(),
      },
    };
  }

  /**
   * Find audit events by request ID — useful for tracing
   * a full request lifecycle across multiple domain operations.
   */
  async findByRequestId(requestId: string): Promise<AuditEvent[]> {
    const rows = await this.prisma.auditLog.findMany({
      where: { requestId },
      orderBy: { createdAt: "asc" },
    });

    return rows.map((row) => this.toAuditEvent(row));
  }

  /**
   * Find audit events for a specific actor (user timeline).
   */
  async findByActor(actorId: string, dto: QueryAuditLogsDto) {
    const { skip, take, page, pageSize } = normalizePagination(dto);
    const where = {
      ...this.buildWhereClause(dto),
      actorId,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return paginatedResponse(
      data.map((row) => this.toAuditEvent(row)),
      total,
      page,
      pageSize,
    );
  }

  // ── Helpers ──────────────────────────────────────────────

  private buildWhereClause(
    filters: AuditQueryFilters | QueryAuditLogsDto,
  ): Prisma.AuditLogWhereInput {
    const where: Prisma.AuditLogWhereInput = {};

    if (filters.category) where.category = filters.category;
    if (filters.action) where.action = filters.action;
    if (filters.actorId) where.actorId = filters.actorId;
    if (filters.actorType) where.actorType = filters.actorType;
    if (filters.targetType) where.targetType = filters.targetType;
    if (filters.targetId) where.targetId = filters.targetId;
    if (filters.outcome) where.outcome = filters.outcome;
    if (filters.requestId) where.requestId = filters.requestId;

    const startDate =
      "startDate" in filters && filters.startDate
        ? typeof filters.startDate === "string"
          ? new Date(filters.startDate)
          : filters.startDate
        : undefined;

    const endDate =
      "endDate" in filters && filters.endDate
        ? typeof filters.endDate === "string"
          ? new Date(filters.endDate)
          : filters.endDate
        : undefined;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    return where;
  }

  private toAuditEvent(row: {
    id: string;
    category: string;
    action: string;
    actorType: string;
    actorId: string;
    actorLabel: string | null;
    targetType: string | null;
    targetId: string | null;
    targetLabel: string | null;
    outcome: string;
    details: Prisma.JsonValue;
    requestId: string | null;
    ip: string | null;
    userAgent: string | null;
    createdAt: Date;
  }): AuditEvent {
    return {
      id: row.id,
      category: row.category as AuditCategory,
      action: row.action,
      actor: {
        type: row.actorType as AuditActor["type"],
        id: row.actorId,
        label: row.actorLabel,
      },
      target: row.targetType
        ? {
            type: row.targetType,
            id: row.targetId!,
            label: row.targetLabel,
          }
        : null,
      outcome: row.outcome as AuditOutcome,
      details: (row.details ?? {}) as Record<string, unknown>,
      requestId: row.requestId,
      ip: row.ip,
      userAgent: row.userAgent,
      createdAt: row.createdAt,
    };
  }

  private toLogEntry(event: AuditEvent): Record<string, unknown> {
    return {
      auditId: event.id,
      category: event.category,
      action: event.action,
      actorType: event.actor.type,
      actorId: event.actor.id,
      targetType: event.target?.type,
      targetId: event.target?.id,
      outcome: event.outcome,
      requestId: event.requestId,
      timestamp: event.createdAt.toISOString(),
    };
  }
}
