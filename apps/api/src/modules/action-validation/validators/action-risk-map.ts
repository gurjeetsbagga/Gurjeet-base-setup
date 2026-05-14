import type { ActionRiskLevel, ActionType } from "../interfaces";

/**
 * Maps each action type to its default risk level.
 *
 * Risk determines approval flow:
 *   - low:      auto-approve, execute immediately
 *   - medium:   validate + execute, notify user
 *   - high:     require explicit user approval before execution
 *   - critical: require admin approval (medical/system actions)
 *
 * These defaults can be overridden by admin configuration in the future.
 */
export const ACTION_RISK_MAP: Record<ActionType, ActionRiskLevel> = {
  read_article: "low",
  journal_prompt: "low",
  start_exercise: "low",
  log_symptom: "medium",
  store_memory: "medium",
  update_preferences: "medium",
  medication_reminder: "high",
  schedule_appointment: "high",
  contact_provider: "high",
  update_recovery_plan: "critical",
};

/**
 * Actions at or above this risk level require explicit user approval
 * before the backend will execute them.
 */
export const APPROVAL_THRESHOLD: ActionRiskLevel = "high";

const RISK_ORDER: Record<ActionRiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

export function requiresApproval(riskLevel: ActionRiskLevel): boolean {
  return RISK_ORDER[riskLevel] >= RISK_ORDER[APPROVAL_THRESHOLD];
}

export function isHigherRisk(a: ActionRiskLevel, b: ActionRiskLevel): boolean {
  return RISK_ORDER[a] > RISK_ORDER[b];
}
