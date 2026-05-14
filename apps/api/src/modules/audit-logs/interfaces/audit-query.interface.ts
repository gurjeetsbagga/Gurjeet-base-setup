import type { AuditCategory, AuditOutcome } from "./audit-event.interface";

/**
 * Filters for querying audit logs.
 * Used by both the service layer and the admin API.
 */
export interface AuditQueryFilters {
  category?: AuditCategory;
  action?: string;
  actorId?: string;
  actorType?: string;
  targetType?: string;
  targetId?: string;
  outcome?: AuditOutcome;
  requestId?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Summary statistics for an audit log query window.
 */
export interface AuditSummary {
  totalEvents: number;
  byCategory: Record<string, number>;
  byOutcome: Record<string, number>;
  period: { start: Date; end: Date };
}
