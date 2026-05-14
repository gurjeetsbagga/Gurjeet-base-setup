import { Module } from "@nestjs/common";
import { AuditLogController } from "./audit-logs.controller";
import { AuditLogService } from "./audit-logs.service";

/**
 * Audit Logs module — centralized, append-only audit trail.
 *
 * Provides AuditLogService for all modules to record auditable events.
 * Exposes admin-only query endpoints for operational visibility,
 * compliance review, debugging, and moderation support.
 *
 * Exported globally so any module can inject AuditLogService without
 * importing AuditLogModule explicitly.
 */
@Module({
  controllers: [AuditLogController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
