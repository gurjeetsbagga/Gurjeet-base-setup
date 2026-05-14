import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { HealthModule } from "../health/health.module";
import { AuditLogModule } from "../audit-logs/audit-logs.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

/**
 * Admin module — system management, AI configuration, and moderation.
 *
 * Imports:
 *   - AiModule:       for provider status and configuration reads
 *   - HealthModule:    for system health in the overview dashboard
 *   - AuditLogModule:  for centralized audit trail recording
 *
 * All controller routes are gated with @Roles(UserRole.ADMIN).
 */
@Module({
  imports: [AiModule, HealthModule, AuditLogModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
