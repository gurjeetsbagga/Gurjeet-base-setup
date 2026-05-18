import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import {
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
  createRequestCorrelation,
  runWithCorrelationContext,
} from "./correlation.context";

/**
 * Binds correlation context for the full HTTP request lifecycle (AsyncLocalStorage).
 * Works with RequestIdMiddleware — requestId must already be on `req`.
 */
@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const requestId =
      (req as Request & { requestId?: string }).requestId ??
      (req.headers[REQUEST_ID_HEADER] as string) ??
      (req.headers[REQUEST_ID_HEADER.toLowerCase()] as string);

    const correlationHeader = req.headers[CORRELATION_ID_HEADER];
    const correlationId =
      typeof correlationHeader === "string" && correlationHeader.length > 0
        ? correlationHeader
        : requestId;

    if (correlationId) {
      res.setHeader(CORRELATION_ID_HEADER, correlationId);
    }

    const userId = (req as Request & { user?: { id?: string } }).user?.id;

    runWithCorrelationContext(
      {
        ...createRequestCorrelation(requestId, correlationId),
        ...(userId ? { userId } : {}),
      },
      () => next(),
    );
  }
}
