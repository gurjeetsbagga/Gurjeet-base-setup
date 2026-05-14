import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { IdParamDto } from "../../common/dto";
import { successResponse } from "../../shared/api-response";
import { ActionValidationService } from "./action-validation.service";
import { ProposeActionDto } from "./dto/propose-action.dto";
import { ResolveActionDto } from "./dto/resolve-action.dto";
import { QueryActionsDto } from "./dto/query-actions.dto";

/**
 * Action validation endpoints — /api/v1/actions.
 *
 * This controller sits between AI-proposed actions and their execution.
 * All actions must flow through this pipeline; there is no backdoor.
 *
 * Typical flow:
 *   1. ConversationsService calls proposeAction() internally when AI
 *      suggests an action card
 *   2. Low-risk actions auto-execute; high-risk ones return to the client
 *      as "pending_approval"
 *   3. The client displays an approval card; user taps approve/reject
 *   4. PATCH /actions/:id/resolve triggers execution or records rejection
 */
@Controller("actions")
export class ActionValidationController {
  constructor(private readonly actionValidationService: ActionValidationService) {}

  /**
   * POST /actions — propose a new action for validation.
   *
   * Primarily called by internal orchestration, but also exposed
   * for testing and future client-initiated actions.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async proposeAction(
    @CurrentUser("id") userId: string,
    @Body() dto: ProposeActionDto,
    @Headers("x-request-id") requestId?: string,
  ) {
    const action = await this.actionValidationService.proposeAction(
      userId,
      dto,
      requestId ?? "unknown",
    );
    return successResponse(action);
  }

  /**
   * PATCH /actions/:id/resolve — approve or reject a pending action.
   */
  @Patch(":id/resolve")
  async resolveAction(
    @CurrentUser("id") userId: string,
    @Param() { id }: IdParamDto,
    @Body() dto: ResolveActionDto,
  ) {
    const action = await this.actionValidationService.resolveAction(userId, id, dto);
    return successResponse(action);
  }

  /**
   * GET /actions — list actions for the current user.
   */
  @Get()
  findMany(@CurrentUser("id") userId: string, @Query() query: QueryActionsDto) {
    const actions = this.actionValidationService.findMany(userId, query);
    return successResponse(actions);
  }

  /**
   * GET /actions/:id — get a single action by ID.
   */
  @Get(":id")
  findById(@CurrentUser("id") userId: string, @Param() { id }: IdParamDto) {
    const action = this.actionValidationService.findById(userId, id);
    return successResponse(action);
  }
}
