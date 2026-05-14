/**
 * Admin-configurable AI settings.
 *
 * Admins can adjust model parameters, toggle features, and manage
 * prompt templates without redeployment. These settings override
 * environment defaults at runtime.
 *
 * Future: stored in a settings table; for now, read from config.
 */
export interface AiAdminSettings {
  model: string;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
  guardrailsEnabled: boolean;
  /** Blocked keyword patterns (regex strings) */
  blockedPatterns: string[];
  /** Custom system prompt override (null = use default) */
  systemPromptOverride: string | null;
}

/**
 * AI usage analytics for the admin dashboard.
 */
export interface AiUsageStats {
  period: string;
  totalRequests: number;
  totalTokens: number;
  averageLatencyMs: number;
  errorRate: number;
  topModels: { model: string; requests: number }[];
}

/**
 * Record of a flagged AI interaction for moderation review.
 */
export interface FlaggedInteraction {
  id: string;
  userId: string;
  conversationId: string;
  messageId: string;
  flagType: ModerationFlagType;
  reason: string;
  content: string;
  status: ModerationStatus;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
}

export type ModerationFlagType =
  | "prompt_injection"
  | "medical_diagnosis"
  | "safety_concern"
  | "content_policy"
  | "user_report";

export type ModerationStatus = "pending" | "reviewed" | "dismissed" | "escalated";
