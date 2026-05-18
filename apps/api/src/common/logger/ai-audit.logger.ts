import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { PinoLogger } from "nestjs-pino";
import { loggingConfig } from "../../config/configs/logging.config";
import { AI_AUDIT_FILE_MAP } from "./ai-audit-categories";
import { AuditPersistenceBridge } from "./audit-persistence.bridge";
import { withCorrelationFields, patchCorrelationContext } from "./correlation.context";
import { FileLogManager } from "./file-log.manager";
import { TELEMETRY_PORT, type TelemetryPort } from "./observability/telemetry.port";
import { redactSensitive, summarizeAiMessages, truncateForLog } from "./redact.util";

export type AiAuditEvent =
  | "ai.orchestration.start"
  | "ai.orchestration.complete"
  | "ai.orchestration.error"
  | "ai.stream.start"
  | "ai.stream.chunk"
  | "ai.stream.complete"
  | "ai.retry"
  | "ai.validation.failed"
  | "ai.safety"
  | "ai.escalation"
  | "ai.moderation"
  | "ai.memory.extract"
  | "ai.memory.retrieve";

export interface AiOrchestrationStartFields {
  requestId: string;
  userId: string;
  conversationId: string;
  model: string;
  provider: string;
  messageCount: number;
  orchestrationId?: string;
  messages?: Array<{ role: string; content: string }>;
}

export interface AiOrchestrationCompleteFields {
  requestId: string;
  userId: string;
  conversationId: string;
  durationMs: number;
  model: string;
  provider: string;
  tokenTotal?: number;
  finishReason?: string;
  responsePreview?: string;
  orchestrationId?: string;
}

@Injectable()
export class AiAuditLogger {
  private readonly context = "AiAudit";

  constructor(
    private readonly pino: PinoLogger,
    @Inject(loggingConfig.KEY)
    private readonly config: ConfigType<typeof loggingConfig>,
    private readonly files: FileLogManager,
    private readonly auditBridge: AuditPersistenceBridge,
    @Inject(TELEMETRY_PORT) private readonly telemetry: TelemetryPort,
  ) {
    this.pino.setContext(this.context);
  }

  logOrchestrationStart(fields: AiOrchestrationStartFields): void {
    if (fields.orchestrationId) {
      patchCorrelationContext({
        orchestrationId: fields.orchestrationId,
        conversationId: fields.conversationId,
        userId: fields.userId,
      });
    }
    this.write("ai.orchestration.start", "AI orchestration started", {
      messageCount: fields.messageCount,
      model: fields.model,
      provider: fields.provider,
      ...(this.config.logAiRequests && fields.messages
        ? {
            messages: summarizeAiMessages(fields.messages, {
              includePreview: !this.config.isProduction,
              isProduction: this.config.isProduction,
            }),
          }
        : {}),
    });
  }

  logOrchestrationComplete(fields: AiOrchestrationCompleteFields): void {
    this.write("ai.orchestration.complete", "AI orchestration completed", {
      durationMs: fields.durationMs,
      tokenTotal: fields.tokenTotal,
      finishReason: fields.finishReason,
      model: fields.model,
      provider: fields.provider,
      ...(this.config.logAiResponses && fields.responsePreview
        ? {
            responsePreview: truncateForLog(fields.responsePreview, this.config.isProduction),
          }
        : {}),
    });
  }

  logOrchestrationError(fields: {
    requestId: string;
    userId: string;
    conversationId: string;
    error: string;
    durationMs?: number;
  }): void {
    this.write(
      "ai.orchestration.error",
      "AI orchestration failed",
      { error: fields.error, durationMs: fields.durationMs },
      "failure",
    );
  }

  logStreamStart(fields: {
    requestId: string;
    userId: string;
    conversationId: string;
    model: string;
    provider: string;
    streamId?: string;
  }): void {
    if (fields.streamId) {
      patchCorrelationContext({ streamId: fields.streamId, conversationId: fields.conversationId });
    }
    this.write("ai.stream.start", "AI stream started", fields);
  }

  logStreamComplete(fields: {
    requestId: string;
    userId: string;
    conversationId: string;
    durationMs: number;
    tokenTotal?: number;
  }): void {
    this.write("ai.stream.complete", "AI stream completed", fields);
  }

  logRetry(fields: {
    requestId: string;
    attempt: number;
    maxAttempts: number;
    reason: string;
    delayMs: number;
  }): void {
    this.write("ai.retry", "AI provider retry", fields, "failure");
  }

  logValidationFailure(fields: {
    requestId: string;
    userId?: string;
    reason: string;
    stage: "pre" | "post" | "structured";
  }): void {
    this.write("ai.validation.failed", "AI validation failed", fields, "denied");
  }

  logSafetyEvent(fields: {
    requestId: string;
    userId: string;
    code: string;
    message?: string;
  }): void {
    this.write(
      "ai.safety",
      "AI safety event",
      {
        code: fields.code,
        ...(fields.message && !this.config.isProduction ? { message: fields.message } : {}),
      },
      "denied",
    );
  }

  logEscalation(fields: { requestId: string; userId: string; type: string }): void {
    this.write("ai.escalation", "AI escalation triggered", { type: fields.type });
  }

  logModeration(fields: {
    requestId: string;
    userId: string;
    code: string;
    messageId?: string;
  }): void {
    this.write("ai.moderation", "AI moderation event", fields, "denied");
  }

  logMemoryExtract(fields: {
    userId: string;
    memoryType: string;
    sourceId?: string;
    importance?: number;
  }): void {
    this.write("ai.memory.extract", "Memory extract orchestration", fields);
  }

  logMemoryRetrieve(fields: { userId: string; resultCount: number; queryLength: number }): void {
    this.write("ai.memory.retrieve", "Memory retrieve orchestration", fields);
  }

  private write(
    event: AiAuditEvent,
    message: string,
    fields: Record<string, unknown>,
    outcome: "success" | "failure" | "denied" = "success",
  ): void {
    const payload = redactSensitive(
      withCorrelationFields({
        type: "ai_audit",
        event,
        module: "ai",
        outcome,
        timestamp: new Date().toISOString(),
        ...fields,
      }),
    );

    const category = AI_AUDIT_FILE_MAP[event];
    this.files.writeAudit(category, payload);

    const span = this.telemetry.startSpan(event, {
      event,
      outcome,
    });
    span.end();

    if (!this.config.enabled && this.config.isProduction) {
      if (
        event === "ai.orchestration.error" ||
        event === "ai.safety" ||
        event === "ai.validation.failed"
      ) {
        this.pino.warn(payload, message);
      }
      void this.auditBridge.persistAiEvent(event, payload, outcome);
      return;
    }

    if (
      event.includes("error") ||
      event === "ai.safety" ||
      event === "ai.validation.failed" ||
      event === "ai.escalation"
    ) {
      this.pino.warn(payload, message);
    } else if (this.config.isDev || this.config.logAiRequests || this.config.logAiResponses) {
      this.pino.info(payload, message);
    } else {
      this.pino.debug(payload, message);
    }

    void this.auditBridge.persistAiEvent(event, payload, outcome);
  }
}
