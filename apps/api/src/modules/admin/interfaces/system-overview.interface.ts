import type { HealthReport } from "../../health/health.service";

/**
 * System-wide overview returned by the admin dashboard endpoint.
 * Aggregates counts, health status, and AI provider info.
 */
export interface SystemOverview {
  health: HealthReport;
  counts: SystemCounts;
  ai: AiProviderStatus;
  environment: string;
  version: string;
  uptime: number;
}

export interface SystemCounts {
  totalUsers: number;
  activeUsers: number;
  totalConversations: number;
  totalMessages: number;
  totalMemoryEntries: number;
}

export interface AiProviderStatus {
  provider: string;
  enabled: boolean;
  model: string;
  /** Aggregate token usage (future: from a usage tracking table) */
  totalTokensUsed?: number;
}
