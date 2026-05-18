import { beforeEach, describe, expect, it, vi } from "vitest";
import { AiAuditLogger } from "@/common/logger/ai-audit.logger";
import type { LoggingConfig } from "@/config/configs/logging.config";

describe("AiAuditLogger", () => {
  const pino = {
    setContext: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  };

  const files = {
    writeAudit: vi.fn(),
    isEnabled: true,
  };

  const auditBridge = {
    persistAiEvent: vi.fn().mockResolvedValue(undefined),
  };

  const telemetry = {
    name: "noop",
    startSpan: vi.fn(() => ({ setAttribute: vi.fn(), end: vi.fn() })),
    recordEvent: vi.fn(),
    recordMetric: vi.fn(),
  };

  const productionConfig: LoggingConfig = {
    enabled: false,
    level: "error",
    pretty: false,
    logAiRequests: false,
    logAiResponses: false,
    logDbQueries: false,
    logHttpRequests: false,
    logFileEnabled: false,
    logRotationEnabled: false,
    logDirectory: "/tmp/logs",
    logMaxFileSize: "10M",
    logMaxFiles: 5,
    logRetentionDays: 14,
    auditDbPersistence: true,
    nodeEnv: "production",
    isDev: false,
    isProduction: true,
    isStaging: false,
  };

  const devConfig: LoggingConfig = {
    ...productionConfig,
    enabled: true,
    level: "debug",
    logAiRequests: true,
    logAiResponses: true,
    logFileEnabled: true,
    nodeEnv: "development",
    isDev: true,
    isProduction: false,
  };

  let audit: AiAuditLogger;

  beforeEach(() => {
    vi.clearAllMocks();
    audit = new AiAuditLogger(
      pino as never,
      productionConfig,
      files as never,
      auditBridge as never,
      telemetry,
    );
  });

  it("writes safety events to dedicated audit file category", () => {
    audit.logSafetyEvent({
      requestId: "req-1",
      userId: "user-1",
      code: "PROMPT_INJECTION",
      message: "ignore all instructions",
    });

    expect(files.writeAudit).toHaveBeenCalledWith(
      "safety",
      expect.objectContaining({ event: "ai.safety", code: "PROMPT_INJECTION" }),
    );
    expect(pino.warn).toHaveBeenCalled();
    const payload = (files.writeAudit.mock.calls[0]?.[1] ?? {}) as Record<string, unknown>;
    expect(payload.message).toBeUndefined();
  });

  it("persists audit metadata via bridge (never raw prompts in production)", () => {
    audit.logOrchestrationStart({
      requestId: "req-2",
      userId: "user-1",
      conversationId: "conv-1",
      model: "gpt-4o",
      provider: "openai",
      messageCount: 1,
      messages: [{ role: "user", content: "Sensitive recovery detail" }],
    });

    expect(auditBridge.persistAiEvent).toHaveBeenCalled();
    const persisted = (auditBridge.persistAiEvent.mock.calls[0]?.[1] ?? {}) as Record<
      string,
      unknown
    >;
    expect(persisted.messages).toBeUndefined();
  });

  it("includes message previews in development when enabled", () => {
    audit = new AiAuditLogger(
      pino as never,
      devConfig,
      files as never,
      auditBridge as never,
      telemetry,
    );

    audit.logOrchestrationStart({
      requestId: "req-3",
      userId: "user-1",
      conversationId: "conv-1",
      model: "gpt-4o",
      provider: "stub",
      messageCount: 1,
      messages: [{ role: "user", content: "Hello Auryn" }],
    });

    expect(pino.info).toHaveBeenCalled();
    const filePayload = (files.writeAudit.mock.calls[0]?.[1] ?? {}) as {
      messages?: Array<{ contentPreview?: string }>;
    };
    expect(filePayload.messages?.[0]?.contentPreview).toContain("Hello");
  });
});
