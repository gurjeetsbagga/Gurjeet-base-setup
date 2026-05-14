import type { ActionRiskLevel, ActionType } from "./action.interface";

/**
 * Result of validating a proposed action.
 *
 * Validation checks:
 *   1. Schema: payload matches the expected shape for this action type
 *   2. Permissions: the user is allowed to perform this action
 *   3. Safety: the action doesn't violate medical/safety boundaries
 *   4. Business rules: action-specific domain constraints
 */
export interface ValidationResult {
  valid: boolean;
  riskLevel: ActionRiskLevel;
  requiresApproval: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  /** Sanitized payload (may be modified during validation) */
  sanitizedPayload: Record<string, unknown> | null;
}

export interface ValidationError {
  code: string;
  field?: string;
  message: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
}

/**
 * Context provided to validators so they can make informed decisions
 * without coupling to request objects.
 */
export interface ValidationContext {
  userId: string;
  userRoles: string[];
  conversationId: string;
  messageId: string;
  requestId: string;
}

/**
 * Contract for per-action-type validators.
 *
 * Each ActionType has a registered validator that implements this
 * interface. The registry maps action types to validators at boot.
 *
 * Validators are pure business-rule checkers — they never execute
 * side effects. Execution is a separate step after approval.
 */
export interface ActionValidator {
  /** Which action type this validator handles */
  readonly actionType: ActionType;

  /** The risk level for this action type (drives approval requirements) */
  readonly defaultRiskLevel: ActionRiskLevel;

  /**
   * Validate the action payload and context.
   * Returns a ValidationResult that the pipeline uses to decide
   * whether the action can proceed.
   */
  validate(payload: Record<string, unknown>, context: ValidationContext): Promise<ValidationResult>;
}

/** DI token for injecting the set of registered action validators */
export const ACTION_VALIDATORS = Symbol("ACTION_VALIDATORS");
