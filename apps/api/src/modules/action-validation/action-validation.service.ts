import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  NotImplementedException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type {
  ActionType,
  ActionStatus,
  ProposedAction,
  ValidationContext,
  ValidationResult,
  ExecutionResult,
  ActionValidator,
} from "./interfaces";
import type { ProposeActionDto } from "./dto/propose-action.dto";
import type { ResolveActionDto } from "./dto/resolve-action.dto";
import type { QueryActionsDto } from "./dto/query-actions.dto";
import { ACTION_RISK_MAP, requiresApproval } from "./validators/action-risk-map";
import {
  ReadArticleValidator,
  LogSymptomValidator,
  MedicationReminderValidator,
  GenericActionValidator,
} from "./validators";

const ACTION_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Core action validation pipeline.
 *
 * Enforces the rule: AI must NEVER directly modify database state,
 * medical workflows, or system actions without backend validation.
 *
 * Pipeline:
 *   1. AI proposes an action (via conversation orchestration)
 *   2. Pipeline validates the action (schema + business rules + safety)
 *   3. If risk is low/medium → auto-approve and execute
 *   4. If risk is high/critical → hold for user/admin approval
 *   5. On approval → execute with full audit trail
 *   6. On rejection → record reason, notify AI context
 *
 * Future: ProposedAction records will be persisted in a dedicated table.
 * Currently, actions are held in-memory for the scaffold phase.
 */
@Injectable()
export class ActionValidationService {
  private readonly logger = new Logger(ActionValidationService.name);

  /** In-memory action store — replaced by DB persistence later */
  private readonly actions = new Map<string, ProposedAction>();

  private readonly validatorRegistry: Map<ActionType, ActionValidator>;

  constructor(
    private readonly readArticleValidator: ReadArticleValidator,
    private readonly logSymptomValidator: LogSymptomValidator,
    private readonly medicationReminderValidator: MedicationReminderValidator,
    private readonly genericValidator: GenericActionValidator,
  ) {
    this.validatorRegistry = new Map<ActionType, ActionValidator>();
    this.registerValidator(readArticleValidator);
    this.registerValidator(logSymptomValidator);
    this.registerValidator(medicationReminderValidator);
  }

  private registerValidator(validator: ActionValidator): void {
    this.validatorRegistry.set(validator.actionType, validator);
    this.logger.debug(`Registered validator for action type: ${validator.actionType}`);
  }

  // ── Pipeline Entry Point ─────────────────────────────────

  /**
   * Propose and validate an action from AI output.
   *
   * This is the ONLY way actions enter the system. The AI module
   * calls this after extracting action cards from a completion.
   *
   * Returns the validated ProposedAction with its status:
   *   - "validated" + auto-approved → will be executed
   *   - "pending_approval" → waiting for user/admin confirmation
   *   - "rejected" → validation failed, with reasons
   */
  async proposeAction(
    userId: string,
    dto: ProposeActionDto,
    requestId: string,
  ): Promise<ProposedAction> {
    const actionId = randomUUID();
    const riskLevel = ACTION_RISK_MAP[dto.type];

    this.logger.log(
      `Action proposed [${actionId}]: type=${dto.type} risk=${riskLevel} ` +
        `user=${userId} conversation=${dto.conversationId}`,
    );

    const context: ValidationContext = {
      userId,
      userRoles: [],
      conversationId: dto.conversationId,
      messageId: dto.messageId,
      requestId,
    };

    const validation = await this.validateAction(dto.type, dto.payload, context);

    let status: ActionStatus;

    if (!validation.valid) {
      status = "rejected";
    } else if (requiresApproval(validation.riskLevel)) {
      status = "pending_approval";
    } else {
      status = "validated";
    }

    const action: ProposedAction = {
      id: actionId,
      type: dto.type,
      userId,
      conversationId: dto.conversationId,
      messageId: dto.messageId,
      description: dto.description,
      payload: validation.sanitizedPayload ?? dto.payload,
      priority: dto.priority ?? "medium",
      riskLevel: validation.riskLevel,
      status,
      validation,
      resolvedBy: null,
      rejectionReason: validation.valid ? null : validation.errors.map((e) => e.message).join("; "),
      executionResult: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + ACTION_TTL_MS),
    };

    this.actions.set(actionId, action);

    if (status === "validated") {
      return this.autoExecute(action);
    }

    return action;
  }

  // ── Approval / Rejection ─────────────────────────────────

  /**
   * Resolve (approve or reject) a pending action.
   * Only the owning user or an admin can resolve an action.
   */
  async resolveAction(
    userId: string,
    actionId: string,
    dto: ResolveActionDto,
  ): Promise<ProposedAction> {
    const action = this.getActionOrThrow(actionId);

    if (action.userId !== userId) {
      throw new ForbiddenException("You can only resolve your own actions");
    }

    if (action.status !== "pending_approval") {
      throw new BadRequestException(`Action is in "${action.status}" state and cannot be resolved`);
    }

    if (this.isExpired(action)) {
      action.status = "expired";
      action.updatedAt = new Date();
      this.logger.log(`Action expired [${actionId}]`);
      return action;
    }

    if (dto.resolution === "approved") {
      action.status = "approved";
      action.resolvedBy = userId;
      action.updatedAt = new Date();

      this.logger.log(`Action approved [${actionId}] by user=${userId}`);
      return this.executeAction(action);
    }

    action.status = "rejected";
    action.resolvedBy = userId;
    action.rejectionReason = dto.reason ?? "User rejected the action";
    action.updatedAt = new Date();

    this.logger.log(`Action rejected [${actionId}] by user=${userId}: ${action.rejectionReason}`);
    return action;
  }

  // ── Query ────────────────────────────────────────────────

  findById(userId: string, actionId: string): ProposedAction {
    const action = this.getActionOrThrow(actionId);
    if (action.userId !== userId) {
      throw new ForbiddenException("Access denied");
    }
    return action;
  }

  findMany(userId: string, query: QueryActionsDto): ProposedAction[] {
    let results = Array.from(this.actions.values()).filter((a) => a.userId === userId);

    if (query.type) {
      results = results.filter((a) => a.type === query.type);
    }
    if (query.status) {
      results = results.filter((a) => a.status === query.status);
    }
    if (query.conversationId) {
      results = results.filter((a) => a.conversationId === query.conversationId);
    }

    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const start = (page - 1) * pageSize;

    return results.slice(start, start + pageSize);
  }

  // ── Validation ───────────────────────────────────────────

  private async validateAction(
    type: ActionType,
    payload: Record<string, unknown>,
    context: ValidationContext,
  ): Promise<ValidationResult> {
    const validator = this.validatorRegistry.get(type) ?? this.genericValidator;

    this.logger.debug(
      `Validating action [${context.requestId}]: type=${type} validator=${validator.constructor.name}`,
    );

    return validator.validate(payload, context);
  }

  // ── Execution ────────────────────────────────────────────

  /**
   * Auto-execute low/medium-risk validated actions.
   */
  private async autoExecute(action: ProposedAction): Promise<ProposedAction> {
    action.status = "approved";
    action.resolvedBy = "system";
    action.updatedAt = new Date();

    this.logger.log(
      `Auto-approved action [${action.id}]: type=${action.type} risk=${action.riskLevel}`,
    );

    return this.executeAction(action);
  }

  /**
   * Execute an approved action.
   *
   * Future: delegates to per-type ActionExecutors that perform
   * the actual side effects. Currently returns a scaffold result.
   */
  private async executeAction(action: ProposedAction): Promise<ProposedAction> {
    action.status = "executing";
    action.updatedAt = new Date();

    const startTime = Date.now();

    try {
      const result = await this.delegateExecution(action);
      action.status = result.success ? "completed" : "failed";
      action.executionResult = result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown execution error";
      action.status = "failed";
      action.executionResult = {
        success: false,
        actionType: action.type,
        outcome: null,
        message,
        error: { code: "EXECUTION_ERROR", message, retryable: false },
        executedAt: new Date(),
        durationMs: Date.now() - startTime,
      };

      this.logger.error(`Action execution failed [${action.id}]: ${message}`);
    }

    action.updatedAt = new Date();
    return action;
  }

  /**
   * Delegate to the appropriate executor based on action type.
   * Future: resolved via ACTION_EXECUTORS DI token.
   */
  private async delegateExecution(action: ProposedAction): Promise<ExecutionResult> {
    const startTime = Date.now();

    switch (action.type) {
      case "read_article":
      case "journal_prompt":
      case "start_exercise":
        return {
          success: true,
          actionType: action.type,
          outcome: { presented: true },
          message: `${action.type} action presented to user`,
          error: null,
          executedAt: new Date(),
          durationMs: Date.now() - startTime,
        };

      case "log_symptom":
      case "store_memory":
      case "update_preferences":
      case "medication_reminder":
      case "schedule_appointment":
      case "contact_provider":
      case "update_recovery_plan":
        throw new NotImplementedException(
          `Executor for "${action.type}" is not yet implemented. ` +
            "This action type requires a dedicated executor with database integration.",
        );

      default:
        throw new BadRequestException(`Unknown action type: ${action.type}`);
    }
  }

  // ── Helpers ──────────────────────────────────────────────

  private getActionOrThrow(actionId: string): ProposedAction {
    const action = this.actions.get(actionId);
    if (!action) {
      throw new NotFoundException(`Action ${actionId} not found`);
    }
    return action;
  }

  private isExpired(action: ProposedAction): boolean {
    return action.expiresAt.getTime() < Date.now();
  }
}
