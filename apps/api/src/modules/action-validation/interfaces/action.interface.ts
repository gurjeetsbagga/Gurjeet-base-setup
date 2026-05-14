import type { ValidationResult } from "./validation.interface";
import type { ExecutionResult } from "./execution.interface";

/**
 * Core action types in the Auryn ecosystem.
 *
 * Every action an AI can propose is typed here. The backend
 * validates each action BEFORE execution — AI never directly
 * modifies database state, medical workflows, or system actions.
 *
 * Actions flow through the pipeline:
 *
 *   AI proposes → validate → [optional user approval] → execute
 *
 * Each ActionType maps to a registered validator that knows
 * the rules, constraints, and risk level for that operation.
 */
export type ActionType =
  | "schedule_appointment"
  | "log_symptom"
  | "read_article"
  | "start_exercise"
  | "medication_reminder"
  | "journal_prompt"
  | "contact_provider"
  | "update_recovery_plan"
  | "store_memory"
  | "update_preferences";

/**
 * Risk classification determines whether an action can auto-execute
 * or requires explicit user/admin approval.
 */
export type ActionRiskLevel = "low" | "medium" | "high" | "critical";

/**
 * Lifecycle state of a proposed action.
 */
export type ActionStatus =
  | "pending_validation"
  | "validated"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "executing"
  | "completed"
  | "failed"
  | "expired";

/**
 * An action proposed by the AI during a conversation.
 * This is the canonical shape that flows through the validation pipeline.
 */
export interface ProposedAction {
  /** Unique identifier for this action instance */
  id: string;
  /** The action type to execute */
  type: ActionType;
  /** User the action targets */
  userId: string;
  /** Conversation that produced this action (traceability) */
  conversationId: string;
  /** Message that triggered the action */
  messageId: string;
  /** Human-readable description of what the action will do */
  description: string;
  /** Action-specific payload — validated by the type's registered validator */
  payload: Record<string, unknown>;
  /** AI-assigned priority */
  priority: ActionPriority;
  /** Computed risk level (set by the validation pipeline) */
  riskLevel: ActionRiskLevel;
  /** Current lifecycle state */
  status: ActionStatus;
  /** Validation result (populated after validation) */
  validation: ValidationResult | null;
  /** Who approved/rejected this action (user ID or "system") */
  resolvedBy: string | null;
  /** Why the action was rejected (if applicable) */
  rejectionReason: string | null;
  /** Execution result (populated after execution) */
  executionResult: ExecutionResult | null;
  createdAt: Date;
  updatedAt: Date;
  /** TTL — actions expire if not approved within this window */
  expiresAt: Date;
}

export type ActionPriority = "low" | "medium" | "high";
