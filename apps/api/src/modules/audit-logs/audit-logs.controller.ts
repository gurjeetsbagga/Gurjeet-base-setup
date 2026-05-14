import { Controller, Get, Param, Query } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { successResponse } from "../../shared/api-response";
import { UserRole } from "../auth/interfaces";
import { AuditLogService } from "./audit-logs.service";
import { QueryAuditLogsDto } from "./dto/query-audit-logs.dto";

/**
 * Audit log query endpoints — /api/v1/audit-logs.
 *
 * All routes are admin-only. Provides operational visibility,
 * compliance review, and debugging capabilities.
 *
 * Audit logs are append-only and immutable — no create/update/delete
 * endpoints exist here. Recording is done programmatically via
 * AuditLogService.record() from other modules.
 */
@Roles(UserRole.ADMIN)
@Controller("audit-logs")
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  /**
   * GET /audit-logs — query audit events with filters and pagination.
   */
  @Get()
  async findMany(@Query() query: QueryAuditLogsDto) {
    const result = await this.auditLogService.findMany(query);
    return successResponse(result);
  }

  /**
   * GET /audit-logs/summary — aggregate summary for a time window.
   */
  @Get("summary")
  async getSummary(@Query() query: QueryAuditLogsDto) {
    const summary = await this.auditLogService.getSummary({
      category: query.category,
      action: query.action,
      actorId: query.actorId,
      actorType: query.actorType,
      targetType: query.targetType,
      targetId: query.targetId,
      outcome: query.outcome,
      requestId: query.requestId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
    return successResponse(summary);
  }

  /**
   * GET /audit-logs/trace/:requestId — all events for a single request.
   * Useful for debugging a full request lifecycle.
   */
  @Get("trace/:requestId")
  async traceRequest(@Param("requestId") requestId: string) {
    const events = await this.auditLogService.findByRequestId(requestId);
    return successResponse(events);
  }

  /**
   * GET /audit-logs/actor/:actorId — events for a specific actor.
   * Useful for user activity timeline and compliance review.
   */
  @Get("actor/:actorId")
  async findByActor(@Param("actorId") actorId: string, @Query() query: QueryAuditLogsDto) {
    const result = await this.auditLogService.findByActor(actorId, query);
    return successResponse(result);
  }
}
