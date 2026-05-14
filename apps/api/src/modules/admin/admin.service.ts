import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  NotImplementedException,
} from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { openaiConfig } from "../../config/configs/openai.config";
import { AiService } from "../ai/ai.service";
import { HealthService } from "../health/health.service";
import { AuditLogService } from "../audit-logs/audit-logs.service";
import { AuditActions } from "../audit-logs/interfaces";
import type { UpdateAiConfigDto } from "./dto/update-ai-config.dto";
import type { UpdateUserRoleDto, UpdateUserStatusDto } from "./dto/manage-user.dto";
import type { ReviewModerationDto } from "./dto/review-moderation.dto";
import type { SystemOverview, SystemCounts, AiAdminSettings, AiUsageStats } from "./interfaces";

/**
 * Admin operations service.
 *
 * All methods require the caller to be authenticated with UserRole.ADMIN.
 * Enforcement happens at the controller level via @Roles(UserRole.ADMIN).
 *
 * Audit logging: every mutation records who did what and when
 * via the centralized AuditLogService.
 */
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly healthService: HealthService,
    private readonly aiService: AiService,
    private readonly auditLogService: AuditLogService,
    @Inject(openaiConfig.KEY)
    private readonly aiConfig: ConfigType<typeof openaiConfig>,
  ) {}

  // ── System Overview ──────────────────────────────────────

  async getSystemOverview(): Promise<SystemOverview> {
    const [health, counts] = await Promise.all([
      this.healthService.readiness(),
      this.getSystemCounts(),
    ]);

    return {
      health,
      counts,
      ai: {
        provider: this.aiService.providerName,
        enabled: this.aiService.isEnabled,
        model: this.aiConfig.model,
      },
      environment: process.env.NODE_ENV ?? "development",
      version: "1",
      uptime: health.uptime,
    };
  }

  private async getSystemCounts(): Promise<SystemCounts> {
    const [totalUsers, activeUsers, totalConversations, totalMessages, totalMemoryEntries] =
      await this.prisma.$transaction([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.conversation.count(),
        this.prisma.message.count(),
        this.prisma.memoryEntry.count(),
      ]);

    return {
      totalUsers,
      activeUsers,
      totalConversations,
      totalMessages,
      totalMemoryEntries,
    };
  }

  // ── AI Configuration ─────────────────────────────────────

  getAiSettings(): AiAdminSettings {
    return {
      model: this.aiConfig.model,
      maxTokens: this.aiConfig.maxTokens,
      temperature: this.aiConfig.temperature,
      enabled: this.aiConfig.enabled,
      guardrailsEnabled: true,
      blockedPatterns: [],
      systemPromptOverride: null,
    };
  }

  async updateAiSettings(adminId: string, _dto: UpdateAiConfigDto): Promise<AiAdminSettings> {
    await this.auditLogService.record({
      category: "admin",
      action: AuditActions.ADMIN_CONFIG_UPDATED,
      actor: { type: "admin", id: adminId, label: null },
      target: { type: "ai_settings", id: "global", label: "AI Configuration" },
      details: {},
    });

    throw new NotImplementedException(
      "Runtime AI configuration updates require a settings persistence layer. " +
        "Currently AI settings are managed via environment variables.",
    );
  }

  getAiUsageStats(): AiUsageStats {
    return {
      period: "all_time",
      totalRequests: 0,
      totalTokens: 0,
      averageLatencyMs: 0,
      errorRate: 0,
      topModels: [{ model: this.aiConfig.model, requests: 0 }],
    };
  }

  // ── User Management ──────────────────────────────────────

  async updateUserRole(adminId: string, userId: string, dto: UpdateUserRoleDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role },
    });

    await this.auditLogService.record({
      category: "admin",
      action: AuditActions.USER_ROLE_CHANGED,
      actor: { type: "admin", id: adminId, label: null },
      target: { type: "user", id: userId, label: user.email },
      details: { previousRole: user.role, newRole: dto.role },
    });

    this.logger.log(`User ${userId} role changed: ${user.role} → ${dto.role} by admin ${adminId}`);
  }

  async updateUserStatus(adminId: string, userId: string, dto: UpdateUserStatusDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: dto.isActive },
    });

    const action = dto.isActive ? AuditActions.USER_REACTIVATED : AuditActions.USER_DEACTIVATED;

    await this.auditLogService.record({
      category: "admin",
      action,
      actor: { type: "admin", id: adminId, label: null },
      target: { type: "user", id: userId, label: user.email },
      details: {},
    });

    this.logger.log(
      `User ${userId} ${dto.isActive ? "reactivated" : "deactivated"} by admin ${adminId}`,
    );
  }

  // ── Moderation ───────────────────────────────────────────

  async reviewFlaggedInteraction(
    adminId: string,
    flagId: string,
    _dto: ReviewModerationDto,
  ): Promise<void> {
    await this.auditLogService.record({
      category: "moderation",
      action: AuditActions.MODERATION_REVIEWED,
      actor: { type: "admin", id: adminId, label: null },
      target: { type: "flagged_interaction", id: flagId, label: null },
      details: {},
    });

    throw new NotImplementedException(
      "Moderation review requires the flagged_interactions persistence layer.",
    );
  }
}
