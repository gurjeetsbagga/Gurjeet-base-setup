import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { PinoLogger } from "nestjs-pino";
import { loggingConfig } from "../../config/configs/logging.config";
import { redactSensitive } from "./redact.util";

export type LogFields = Record<string, unknown>;

/**
 * Central application logger — thin facade over nestjs-pino.
 * Use domain-specific loggers (e.g. AiAuditLogger) for orchestration audit trails.
 */
@Injectable()
export class LoggerService {
  constructor(
    private readonly pino: PinoLogger,
    @Inject(loggingConfig.KEY)
    private readonly config: ConfigType<typeof loggingConfig>,
  ) {
    this.pino.setContext(LoggerService.name);
  }

  child(context: string): LoggerService {
    const childLogger = new LoggerService(this.pino, this.config);
    childLogger.pino.setContext(context);
    return childLogger;
  }

  setContext(context: string): void {
    this.pino.setContext(context);
  }

  debug(message: string, fields?: LogFields): void {
    if (!this.config.enabled && this.config.isProduction) return;
    this.pino.debug(this.safeFields(fields), message);
  }

  info(message: string, fields?: LogFields): void {
    this.pino.info(this.safeFields(fields), message);
  }

  warn(message: string, fields?: LogFields): void {
    this.pino.warn(this.safeFields(fields), message);
  }

  error(message: string, fields?: LogFields): void {
    this.pino.error(this.safeFields(fields), message);
  }

  private safeFields(fields?: LogFields): LogFields | undefined {
    if (!fields) return undefined;
    return redactSensitive(fields);
  }
}
