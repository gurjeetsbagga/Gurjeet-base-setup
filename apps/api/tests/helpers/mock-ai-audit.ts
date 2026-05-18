import { vi } from "vitest";
import type { AiAuditLogger } from "@/common/logger/ai-audit.logger";

export function createMockAiAuditLogger(): AiAuditLogger {
  return {
    logOrchestrationStart: vi.fn(),
    logOrchestrationComplete: vi.fn(),
    logOrchestrationError: vi.fn(),
    logStreamStart: vi.fn(),
    logStreamComplete: vi.fn(),
    logRetry: vi.fn(),
    logValidationFailure: vi.fn(),
    logSafetyEvent: vi.fn(),
    logEscalation: vi.fn(),
  } as unknown as AiAuditLogger;
}
