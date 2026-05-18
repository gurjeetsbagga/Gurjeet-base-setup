import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { FileLogManager } from "@/common/logger/file-log.manager";
import type { LoggingConfig } from "@/config/configs/logging.config";

describe("FileLogManager", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "auryn-logs-"));

  afterEach(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  const baseConfig: LoggingConfig = {
    enabled: true,
    level: "debug",
    pretty: false,
    logAiRequests: true,
    logAiResponses: true,
    logDbQueries: false,
    logHttpRequests: true,
    logFileEnabled: true,
    logRotationEnabled: false,
    logDirectory: tempRoot,
    logMaxFileSize: "1M",
    logMaxFiles: 3,
    logRetentionDays: 1,
    auditDbPersistence: false,
    nodeEnv: "development",
    isDev: true,
    isProduction: false,
    isStaging: false,
  };

  it("creates api and audit directories and writes audit lines", () => {
    const manager = new FileLogManager(baseConfig);
    manager.onModuleInit();

    manager.writeAudit("safety", { event: "ai.safety", code: "TEST" });
    manager.onModuleDestroy();

    const safetyPath = path.join(tempRoot, "audit", "safety-events.log");
    expect(fs.existsSync(safetyPath)).toBe(true);
    const content = fs.readFileSync(safetyPath, "utf8");
    expect(content).toContain("ai.safety");
  });

  it("prunes files older than retention", () => {
    const auditDir = path.join(tempRoot, "audit", "stale");
    fs.mkdirSync(auditDir, { recursive: true });
    const staleFile = path.join(auditDir, "old.log");
    fs.writeFileSync(staleFile, "stale");
    const old = Date.now() - 5 * 24 * 60 * 60 * 1000;
    fs.utimesSync(staleFile, old / 1000, old / 1000);

    const manager = new FileLogManager(baseConfig);
    manager.pruneExpiredFiles();

    expect(fs.existsSync(staleFile)).toBe(false);
  });
});
