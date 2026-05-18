import { Inject, Injectable, Optional } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { loggingConfig } from "../../config/configs/logging.config";
import { AuditLogService } from "../../modules/audit-logs/audit-logs.service";
import { AuditActions } from "../../modules/audit-logs/interfaces";
import type { AiAuditEvent } from "./ai-audit.logger";
import { withCorrelationFields } from "./correlation.context";
import { redactSensitive } from "./redact.util";

/**
 * Persists AI audit metadata to `audit_logs` via AuditLogService.
 * AI never writes directly — only this bridge after backend validation.
 */
@Injectable()
export class AuditPersistenceBridge {
  constructor(
    @Optional() private readonly auditLogs: AuditLogService | null,
    @Inject(loggingConfig.KEY)
    private readonly config: ConfigType<typeof loggingConfig>,
  ) {}

  async persistAiEvent(
    event: AiAuditEvent,
    fields: Record<string, unknown>,
    outcome: "success" | "failure" | "denied" = "success",
  ): Promise<void> {
    if (!this.config.auditDbPersistence || !this.auditLogs) return;

    const action = mapEventToAuditAction(event);
    const safeDetails = redactSensitive(withCorrelationFields(fields));

    const userId = typeof safeDetails.userId === "string" ? safeDetails.userId : "system";
    const conversationId =
      typeof safeDetails.conversationId === "string" ? safeDetails.conversationId : null;

    await this.auditLogs.record({
      category: event.startsWith("ai.memory") ? "memory" : "ai",
      action,
      actor: {
        type: "system",
        id: "ai-orchestration",
        label: "AI Orchestration",
      },
      target: conversationId
        ? { type: "conversation", id: conversationId, label: null }
        : { type: "user", id: userId, label: null },
      outcome,
      details: safeDetails,
      requestId: typeof safeDetails.requestId === "string" ? safeDetails.requestId : undefined,
    });
  }
}

function mapEventToAuditAction(event: AiAuditEvent): string {
  switch (event) {
    case "ai.orchestration.start":
      return AuditActions.AI_COMPLETION_REQUESTED;
    case "ai.orchestration.complete":
      return AuditActions.AI_COMPLETION_SUCCEEDED;
    case "ai.orchestration.error":
      return AuditActions.AI_COMPLETION_FAILED;
    case "ai.stream.start":
      return AuditActions.AI_STREAM_STARTED;
    case "ai.stream.complete":
      return AuditActions.AI_STREAM_COMPLETED;
    case "ai.safety":
      return AuditActions.AI_GUARDRAIL_BLOCKED;
    case "ai.validation.failed":
      return AuditActions.AI_GUARDRAIL_FLAGGED;
    case "ai.escalation":
      return AuditActions.MODERATION_ESCALATED;
    case "ai.moderation":
      return AuditActions.MODERATION_FLAGGED;
    case "ai.memory.extract":
      return AuditActions.MEMORY_STORED;
    case "ai.memory.retrieve":
      return AuditActions.MEMORY_RETRIEVED;
    case "ai.retry":
      return "ai.retry";
    default:
      return event;
  }
}
