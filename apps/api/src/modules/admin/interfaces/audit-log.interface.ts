/**
 * @deprecated Use AuditEvent and AuditActions from the audit-logs module.
 * These types are preserved for backward compatibility during migration.
 */
export type { AuditEvent as AuditLogEntry } from "../../audit-logs/interfaces";
export type { AuditActionValue as AdminAction } from "../../audit-logs/interfaces";
