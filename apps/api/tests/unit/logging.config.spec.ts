import { afterEach, describe, expect, it } from "vitest";
import { loggingConfig } from "@/config/configs/logging.config";

describe("loggingConfig", () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
  });

  it("enables pretty logging in development by default", () => {
    process.env.NODE_ENV = "development";
    delete process.env.LOGGING_ENABLED;
    delete process.env.LOG_PRETTY;

    const cfg = loggingConfig();

    expect(cfg.enabled).toBe(true);
    expect(cfg.pretty).toBe(true);
    expect(cfg.level).toBe("debug");
    expect(cfg.logAiRequests).toBe(true);
    expect(cfg.logDbQueries).toBe(false);
    expect(cfg.logFileEnabled).toBe(true);
    expect(cfg.logRotationEnabled).toBe(true);
  });

  it("restricts production defaults", () => {
    process.env.NODE_ENV = "production";
    delete process.env.LOGGING_ENABLED;
    delete process.env.LOG_AI_REQUESTS;
    delete process.env.LOG_AI_RESPONSES;
    delete process.env.LOG_DB_QUERIES;
    delete process.env.LOG_HTTP_REQUESTS;

    const cfg = loggingConfig();

    expect(cfg.enabled).toBe(false);
    expect(cfg.pretty).toBe(false);
    expect(cfg.level).toBe("error");
    expect(cfg.logAiRequests).toBe(false);
    expect(cfg.logAiResponses).toBe(false);
    expect(cfg.logDbQueries).toBe(false);
    expect(cfg.logFileEnabled).toBe(false);
    expect(cfg.logAiRequests).toBe(false);
  });

  it("respects explicit LOGGING_ENABLED in production", () => {
    process.env.NODE_ENV = "production";
    process.env.LOGGING_ENABLED = "true";
    process.env.LOG_LEVEL = "info";

    const cfg = loggingConfig();

    expect(cfg.enabled).toBe(true);
    expect(cfg.level).toBe("info");
  });
});
