import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

export const REQUEST_ID_HEADER = "x-request-id";

/**
 * Assigns a unique request ID to every incoming request.
 *
 * - If the client sends an `x-request-id` header, it is reused (useful
 *   for tracing across API gateway → backend → downstream services).
 * - Otherwise, a new UUID v4 is generated.
 * - The ID is attached to `request.requestId` and echoed back in the
 *   response `x-request-id` header for client-side correlation.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = (req.headers[REQUEST_ID_HEADER] as string) || randomUUID();

    (req as Request & { requestId: string }).requestId = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);

    next();
  }
}
