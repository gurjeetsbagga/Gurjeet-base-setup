import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { Observable, tap } from "rxjs";
import type { Request, Response } from "express";
import { loggingConfig } from "../../config/configs/logging.config";
import { patchCorrelationContext } from "./correlation.context";
import { LoggerService } from "./logger.service";

export interface HttpRequestLogFields extends Record<string, unknown> {
  type: "http_request";
  method: string;
  route: string;
  url: string;
  statusCode: number;
  durationMs: number;
  requestId?: string;
  correlationId?: string;
  userId?: string;
  module?: string;
  ip?: string;
}

/**
 * Enriches request lifecycle logs after guards run (user id available).
 * Complements nestjs-pino HTTP auto-logging with correlation metadata.
 */
@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LoggerService,
    @Inject(loggingConfig.KEY)
    private readonly config: ConfigType<typeof loggingConfig>,
  ) {
    this.logger.setContext("HTTP");
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!this.config.logHttpRequests) {
      return next.handle();
    }

    const req = context
      .switchToHttp()
      .getRequest<Request & { requestId?: string; user?: { id?: string } }>();
    const res = context.switchToHttp().getResponse<Response>();
    const start = Date.now();
    const controller = context.getClass().name;

    if (req.user?.id) {
      patchCorrelationContext({ userId: req.user.id });
    }

    return next.handle().pipe(
      tap({
        next: () => this.logRequest(req, res, start, controller),
        error: () => this.logRequest(req, res, start, controller),
      }),
    );
  }

  private logRequest(
    req: Request & { requestId?: string; user?: { id?: string } },
    res: Response,
    start: number,
    module: string,
  ): void {
    const durationMs = Date.now() - start;
    const fields: HttpRequestLogFields = {
      type: "http_request",
      method: req.method,
      url: req.originalUrl,
      route: req.route?.path ?? req.path,
      statusCode: res.statusCode,
      durationMs,
      requestId: req.requestId,
      correlationId: req.requestId,
      userId: req.user?.id,
      module,
      ip: extractIp(req),
    };

    const message = `${fields.method} ${fields.route} ${fields.statusCode} ${durationMs}ms`;

    if (fields.statusCode >= 500) {
      this.logger.error(message, fields);
    } else if (fields.statusCode >= 400) {
      this.logger.warn(message, fields);
    } else if (this.config.isDev) {
      this.logger.info(message, fields);
    } else {
      this.logger.debug(message, fields);
    }
  }
}

function extractIp(req: Request): string | undefined {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    const first = forwarded.split(",")[0];
    return first ? first.trim() : undefined;
  }
  return req.ip ?? req.socket.remoteAddress;
}
