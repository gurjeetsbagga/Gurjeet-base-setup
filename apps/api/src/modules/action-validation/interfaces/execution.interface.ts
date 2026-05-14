import type { ActionType } from "./action.interface";

/**
 * Result of executing an approved action.
 */
export interface ExecutionResult {
  success: boolean;
  actionType: ActionType;
  /** What the execution produced (action-specific) */
  outcome: Record<string, unknown> | null;
  /** User-facing message describing what happened */
  message: string;
  /** If execution failed, why */
  error: ExecutionError | null;
  executedAt: Date;
  durationMs: number;
}

export interface ExecutionError {
  code: string;
  message: string;
  retryable: boolean;
}

/**
 * Contract for per-action-type executors.
 *
 * Executors run ONLY after an action has been validated and approved.
 * They perform the actual side effect (DB write, external API call, etc.).
 *
 * The separation between validators and executors ensures:
 *   - AI can never bypass validation
 *   - Execution is auditable and reversible where possible
 *   - Failed executions don't corrupt validation state
 */
export interface ActionExecutor {
  /** Which action type this executor handles */
  readonly actionType: ActionType;

  /**
   * Execute the validated, approved action.
   * The payload has already been sanitized by the validator.
   */
  execute(
    payload: Record<string, unknown>,
    context: { userId: string; actionId: string; requestId: string },
  ): Promise<ExecutionResult>;
}

/** DI token for injecting the set of registered action executors */
export const ACTION_EXECUTORS = Symbol("ACTION_EXECUTORS");
