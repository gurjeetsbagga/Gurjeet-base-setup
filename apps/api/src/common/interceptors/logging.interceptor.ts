import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";
import type { Request, Response } from "express";

interface RequestLog {
  type: "request";
  method: string;
  url: string;
  route: string;
  statusCode: number;
  duration: number;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  userId?: string;
  contentLength?: number;
}

/**
 * Global request logging interceptor.
 *
 * Captures structured metadata for every HTTP request:
 * - Method, URL, matched route
 * - Response status code and duration
 * - Client IP, user agent
 * - Request ID (from RequestIdMiddleware)
 * - Authenticated user ID (if present)
 *
 * In development: logs a concise one-liner.
 * In production: logs full structured data (consumed by StructuredLogger as JSON).
 *
 * Sensitive data (request body, auth headers, tokens) is never logged.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");
  private readonly isProduction =
    process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { requestId?: string; user?: { id?: string } }>();
    const res = context.switchToHttp().getResponse<Response>();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;

        if (this.isProduction) {
          const entry: RequestLog = {
            type: "request",
            method: req.method,
            url: req.originalUrl,
            route: req.route?.path ?? req.url,
            statusCode,
            duration,
            requestId: req.requestId,
            ip: extractIp(req),
            userAgent: req.headers["user-agent"],
            userId: req.user?.id,
            contentLength: res.get("content-length")
              ? parseInt(res.get("content-length")!, 10)
              : undefined,
          };
          this.logger.log(entry);
        } else {
          const userId = req.user?.id ? ` user=${req.user.id}` : "";
          const reqId = req.requestId ? ` [${req.requestId.slice(0, 8)}]` : "";
          this.logger.log(
            `${req.method} ${req.originalUrl} ${statusCode} ${duration}ms${userId}${reqId}`,
          );
        }
      }),
    );
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
