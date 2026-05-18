import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { REQUEST_ID_HEADER } from "../logger/correlation.context";

/**
 * Assigns a unique request ID to every incoming request.
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
