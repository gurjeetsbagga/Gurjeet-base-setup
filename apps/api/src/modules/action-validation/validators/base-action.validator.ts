import { Logger } from "@nestjs/common";
import type {
  ActionRiskLevel,
  ActionType,
  ActionValidator,
  ValidationContext,
  ValidationResult,
} from "../interfaces";
import { ACTION_RISK_MAP } from "./action-risk-map";

/**
 * Base class for action validators.
 *
 * Provides common validation logic (safety checks, payload shape)
 * and delegates action-specific rules to subclass hooks.
 *
 * Subclasses override:
 *   - `validatePayload()` for action-specific schema validation
 *   - `checkBusinessRules()` for domain constraints
 */
export abstract class BaseActionValidator implements ActionValidator {
  protected readonly logger: Logger;

  abstract readonly actionType: ActionType;

  get defaultRiskLevel(): ActionRiskLevel {
    return ACTION_RISK_MAP[this.actionType];
  }

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  async validate(
    payload: Record<string, unknown>,
    context: ValidationContext,
  ): Promise<ValidationResult> {
    const errors: ValidationResult["errors"] = [];
    const warnings: ValidationResult["warnings"] = [];

    const payloadResult = this.validatePayload(payload);
    errors.push(...payloadResult.errors);
    warnings.push(...payloadResult.warnings);

    if (errors.length === 0) {
      const ruleResult = await this.checkBusinessRules(payload, context);
      errors.push(...ruleResult.errors);
      warnings.push(...ruleResult.warnings);
    }

    const safetyResult = this.checkSafety(payload, context);
    errors.push(...safetyResult.errors);
    warnings.push(...safetyResult.warnings);

    const riskLevel = this.computeRiskLevel(payload, context);
    const valid = errors.length === 0;

    if (!valid) {
      this.logger.warn(
        `Action validation failed [${this.actionType}] user=${context.userId} ` +
          `errors=${errors.map((e) => e.code).join(",")}`,
      );
    }

    return {
      valid,
      riskLevel,
      requiresApproval: riskLevel === "high" || riskLevel === "critical",
      errors,
      warnings,
      sanitizedPayload: valid ? this.sanitizePayload(payload) : null,
    };
  }

  /**
   * Validate the payload shape/values for this action type.
   * Override in subclasses.
   */
  protected abstract validatePayload(
    payload: Record<string, unknown>,
  ): Pick<ValidationResult, "errors" | "warnings">;

  /**
   * Check domain-specific business rules (e.g. scheduling limits, duplicates).
   * Override in subclasses; base implementation is a no-op pass.
   */
  protected async checkBusinessRules(
    _payload: Record<string, unknown>,
    _context: ValidationContext,
  ): Promise<Pick<ValidationResult, "errors" | "warnings">> {
    return { errors: [], warnings: [] };
  }

  /**
   * Safety boundary checks common to all actions.
   * Prevents medical overreach, unsafe modifications, etc.
   */
  protected checkSafety(
    _payload: Record<string, unknown>,
    _context: ValidationContext,
  ): Pick<ValidationResult, "errors" | "warnings"> {
    return { errors: [], warnings: [] };
  }

  /**
   * Compute the effective risk level (may elevate from the default).
   * Override to escalate risk based on payload content.
   */
  protected computeRiskLevel(
    _payload: Record<string, unknown>,
    _context: ValidationContext,
  ): ActionRiskLevel {
    return this.defaultRiskLevel;
  }

  /**
   * Strip or transform payload fields before execution.
   * Override to redact sensitive data or normalize values.
   */
  protected sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
    return { ...payload };
  }
}
