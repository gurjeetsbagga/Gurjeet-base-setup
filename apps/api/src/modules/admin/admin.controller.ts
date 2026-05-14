import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Put } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { IdParamDto } from "../../common/dto";
import { successResponse } from "../../shared/api-response";
import { UserRole } from "../auth/interfaces";
import { AdminService } from "./admin.service";
import { UpdateAiConfigDto } from "./dto/update-ai-config.dto";
import { UpdateUserRoleDto, UpdateUserStatusDto } from "./dto/manage-user.dto";
import { ReviewModerationDto } from "./dto/review-moderation.dto";

/**
 * Admin endpoints — /api/v1/admin.
 *
 * Every route is gated with @Roles(UserRole.ADMIN) at the class level.
 * The global JwtAuthGuard authenticates first, then RolesGuard enforces
 * the admin requirement. Non-admin users receive 403 Forbidden.
 */
@Roles(UserRole.ADMIN)
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── System ───────────────────────────────────────────────

  /**
   * GET /admin/overview — system dashboard data.
   */
  @Get("overview")
  async getOverview() {
    const overview = await this.adminService.getSystemOverview();
    return successResponse(overview);
  }

  // ── AI Configuration ─────────────────────────────────────

  /**
   * GET /admin/ai/settings — current AI configuration.
   */
  @Get("ai/settings")
  getAiSettings() {
    return successResponse(this.adminService.getAiSettings());
  }

  /**
   * PUT /admin/ai/settings — update AI configuration.
   */
  @Put("ai/settings")
  async updateAiSettings(@CurrentUser("id") adminId: string, @Body() dto: UpdateAiConfigDto) {
    const settings = await this.adminService.updateAiSettings(adminId, dto);
    return successResponse(settings);
  }

  /**
   * GET /admin/ai/usage — AI usage analytics.
   */
  @Get("ai/usage")
  getAiUsage() {
    return successResponse(this.adminService.getAiUsageStats());
  }

  // ── User Management ──────────────────────────────────────

  /**
   * PATCH /admin/users/:id/role — change a user's role.
   */
  @Patch("users/:id/role")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateUserRole(
    @CurrentUser("id") adminId: string,
    @Param() { id }: IdParamDto,
    @Body() dto: UpdateUserRoleDto,
  ) {
    await this.adminService.updateUserRole(adminId, id, dto);
  }

  /**
   * PATCH /admin/users/:id/status — activate or deactivate a user.
   */
  @Patch("users/:id/status")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateUserStatus(
    @CurrentUser("id") adminId: string,
    @Param() { id }: IdParamDto,
    @Body() dto: UpdateUserStatusDto,
  ) {
    await this.adminService.updateUserStatus(adminId, id, dto);
  }

  // ── Moderation ───────────────────────────────────────────

  /**
   * PATCH /admin/moderation/:id/review — review a flagged interaction.
   */
  @Patch("moderation/:id/review")
  @HttpCode(HttpStatus.NO_CONTENT)
  async reviewModeration(
    @CurrentUser("id") adminId: string,
    @Param() { id }: IdParamDto,
    @Body() dto: ReviewModerationDto,
  ) {
    await this.adminService.reviewFlaggedInteraction(adminId, id, dto);
  }
}
