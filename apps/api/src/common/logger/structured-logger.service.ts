import { ConsoleLogger, LogLevel } from "@nestjs/common";

export interface LogEntry {
  level: string;
  message: string;
  context?: string;
  service: string;
  env: string;
  timestamp: string;
  requestId?: string;
  [key: string]: unknown;
}

/**
 * Centralized logger with environment-aware output.
 *
 * - Development: human-readable NestJS format (colored, timestamped)
 * - Staging/Production: newline-delimited JSON (NDJSON) for Railway,
 *   Datadog, CloudWatch, or any structured log aggregator.
 *
 * Usage in services:
 *   private readonly logger = new Logger(MyService.name);
 *
 * The Logger facade delegates to this service when set via app.useLogger().
 */
export class StructuredLogger extends ConsoleLogger {
  private readonly useJson: boolean;
  private readonly serviceName = "auryn-api";
  private readonly env: string;

  constructor(logLevels?: LogLevel[]) {
    super();
    if (logLevels) {
      this.setLogLevels(logLevels);
    }
    this.env = process.env.NODE_ENV ?? "development";
    this.useJson = this.env === "production" || this.env === "staging";
  }

  log(message: unknown, context?: string): void;
  log(message: unknown, ...optionalParams: unknown[]): void;
  log(message: unknown, ...optionalParams: unknown[]): void {
    if (this.useJson) {
      this.writeJson("info", message, optionalParams);
    } else {
      super.log(message, ...optionalParams);
    }
  }

  error(message: unknown, stackOrContext?: string): void;
  error(message: unknown, ...optionalParams: unknown[]): void;
  error(message: unknown, ...optionalParams: unknown[]): void {
    if (this.useJson) {
      this.writeJson("error", message, optionalParams);
    } else {
      super.error(message, ...optionalParams);
    }
  }

  warn(message: unknown, context?: string): void;
  warn(message: unknown, ...optionalParams: unknown[]): void;
  warn(message: unknown, ...optionalParams: unknown[]): void {
    if (this.useJson) {
      this.writeJson("warn", message, optionalParams);
    } else {
      super.warn(message, ...optionalParams);
    }
  }

  debug(message: unknown, context?: string): void;
  debug(message: unknown, ...optionalParams: unknown[]): void;
  debug(message: unknown, ...optionalParams: unknown[]): void {
    if (this.useJson) {
      this.writeJson("debug", message, optionalParams);
    } else {
      super.debug(message, ...optionalParams);
    }
  }

  verbose(message: unknown, context?: string): void;
  verbose(message: unknown, ...optionalParams: unknown[]): void;
  verbose(message: unknown, ...optionalParams: unknown[]): void {
    if (this.useJson) {
      this.writeJson("verbose", message, optionalParams);
    } else {
      super.verbose(message, ...optionalParams);
    }
  }

  /**
   * Write a structured log entry for production.
   * Outputs one JSON object per line — compatible with Railway,
   * Datadog, CloudWatch, ELK, and similar aggregators.
   */
  private writeJson(level: string, message: unknown, params: unknown[]): void {
    const context = extractContext(params);
    const meta = typeof message === "object" && message !== null ? message : undefined;

    const entry: LogEntry = {
      level,
      message: typeof message === "string" ? message : formatNonString(message),
      ...(context && { context }),
      service: this.serviceName,
      env: this.env,
      timestamp: new Date().toISOString(),
      ...(meta && typeof meta === "object" && !Array.isArray(meta)
        ? (meta as Record<string, unknown>)
        : {}),
    };

    const stream = level === "error" ? process.stderr : process.stdout;
    stream.write(JSON.stringify(entry) + "\n");
  }
}

function extractContext(params: unknown[]): string | undefined {
  if (params.length === 0) return undefined;
  const last = params[params.length - 1];
  return typeof last === "string" ? last : undefined;
}

function formatNonString(value: unknown): string {
  if (value instanceof Error) return value.message;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
