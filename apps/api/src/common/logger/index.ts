export { AurynLoggerModule } from "./logger.module";
export { LoggerService } from "./logger.service";
export { AiAuditLogger } from "./ai-audit.logger";
export type { AiAuditEvent, AiOrchestrationStartFields } from "./ai-audit.logger";
export { AuditPersistenceBridge } from "./audit-persistence.bridge";
export { RequestLoggerInterceptor } from "./request-logger.interceptor";
export { CorrelationMiddleware } from "./correlation.middleware";
export { FileLogManager } from "./file-log.manager";
export {
  getCorrelationContext,
  runWithCorrelationContext,
  patchCorrelationContext,
  withCorrelationFields,
  createRequestCorrelation,
  REQUEST_ID_HEADER,
  CORRELATION_ID_HEADER,
} from "./correlation.context";
export type { CorrelationContext } from "./correlation.context";
export { TELEMETRY_PORT } from "./observability/telemetry.port";
export type { TelemetryPort } from "./observability/telemetry.port";
export { buildLoggerModuleParams, buildAppPinoLevel } from "./logger.config";
export {
  redactSensitive,
  truncateForLog,
  summarizeAiMessages,
  REDACT_PATHS,
  isSensitiveKey,
} from "./redact.util";
export { AI_AUDIT_FILE_MAP, AUDIT_FILE_NAMES } from "./ai-audit-categories";
export type { AiAuditFileCategory } from "./ai-audit-categories";
export type { HttpRequestLogFields } from "./request-logger.interceptor";
