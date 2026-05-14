import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { ErrorCode, type ApiErrorResponse, type FieldError } from "./error-codes";

interface ErrorLog {
  type: "error";
  method: string;
  url: string;
  statusCode: number;
  code: ErrorCode;
  errorName: string;
  message: string;
  requestId?: string;
  ip?: string;
  userId?: string;
  validationErrors?: FieldError[];
  stack?: string;
}

/**
 * Global exception filter — the single point of error handling for the API.
 *
 * Responsibilities:
 * 1. Classify exceptions into error codes (validation, auth, not found, etc.)
 * 2. Format validation errors with per-field detail
 * 3. Produce a consistent frontend-safe response envelope
 * 4. Log full diagnostic context to the backend (structured for observability)
 * 5. Never leak internal details (stack traces, DB errors) to clients
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("ExceptionFilter");
  private readonly isDev =
    process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "staging";

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request & { requestId?: string; user?: { id?: string } }>();
    const res = ctx.getResponse<Response>();

    const statusCode = this.resolveStatusCode(exception);
    const code = this.resolveErrorCode(exception, statusCode);
    const message = this.resolveClientMessage(exception, statusCode);
    const validationErrors = this.extractValidationErrors(exception);

    const errorLog: ErrorLog = {
      type: "error",
      method: req.method,
      url: req.originalUrl,
      statusCode,
      code,
      errorName: exception instanceof Error ? exception.constructor.name : "UnknownError",
      message: exception instanceof Error ? exception.message : String(exception),
      requestId: req.requestId,
      ip: extractIp(req),
      userId: req.user?.id,
      ...(validationErrors && { validationErrors }),
      ...(this.isDev && exception instanceof Error && { stack: exception.stack }),
    };

    if (statusCode >= 500) {
      this.logger.error(errorLog);
    } else if (statusCode >= 400) {
      this.logger.warn(errorLog);
    }

    const response: ApiErrorResponse = {
      success: false,
      error: {
        statusCode,
        code,
        message,
        ...(validationErrors && { errors: validationErrors }),
        ...(req.requestId && { requestId: req.requestId }),
        timestamp: new Date().toISOString(),
      },
    };

    res.status(statusCode).json(response);
  }

  private resolveStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolveErrorCode(exception: unknown, statusCode: number): ErrorCode {
    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      if (isValidationResponse(response)) {
        return ErrorCode.VALIDATION_ERROR;
      }
      return ErrorCode.BAD_REQUEST;
    }
    if (exception instanceof UnauthorizedException) return ErrorCode.UNAUTHORIZED;
    if (exception instanceof ForbiddenException) return ErrorCode.FORBIDDEN;
    if (exception instanceof NotFoundException) return ErrorCode.NOT_FOUND;

    switch (statusCode) {
      case 409:
        return ErrorCode.CONFLICT;
      case 429:
        return ErrorCode.RATE_LIMITED;
      case 503:
        return ErrorCode.SERVICE_UNAVAILABLE;
      default:
        return statusCode >= 500 ? ErrorCode.INTERNAL_ERROR : ErrorCode.BAD_REQUEST;
    }
  }

  /**
   * Returns the message sent to the client.
   * For 5xx errors, always returns a generic message to avoid leaking internals.
   */
  private resolveClientMessage(exception: unknown, statusCode: number): string {
    if (statusCode >= 500) {
      return "An unexpected error occurred. Please try again later.";
    }

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      if (isValidationResponse(response)) {
        return "Validation failed";
      }
    }

    if (exception instanceof HttpException) {
      return exception.message;
    }

    return "An error occurred";
  }

  /**
   * Extracts per-field validation errors from NestJS's ValidationPipe.
   *
   * ValidationPipe throws BadRequestException with response:
   *   { statusCode: 400, message: string[], error: "Bad Request" }
   *
   * This method parses those messages into structured field errors
   * that frontends can map to form fields.
   */
  private extractValidationErrors(exception: unknown): FieldError[] | undefined {
    if (!(exception instanceof BadRequestException)) return undefined;

    const response = exception.getResponse();
    if (!isValidationResponse(response)) return undefined;

    const messages = response.message;
    return messages.map(parseValidationMessage);
  }
}

/**
 * Check if a BadRequestException response is from ValidationPipe
 * (has a message array rather than a single string message).
 */
function isValidationResponse(
  response: unknown,
): response is { statusCode: number; message: string[]; error?: string } {
  if (typeof response !== "object" || response === null) return false;
  const r = response as Record<string, unknown>;
  return Array.isArray(r.message) && r.message.every((m: unknown) => typeof m === "string");
}

/**
 * Parse a class-validator message string into a field + message pair.
 *
 * class-validator messages follow patterns like:
 *   "email must be an email"
 *   "password must be longer than or equal to 8 characters"
 *   "property unknownField should not exist"
 *
 * The first word is typically the field name.
 */
function parseValidationMessage(msg: string): FieldError {
  const spaceIndex = msg.indexOf(" ");
  if (spaceIndex === -1) {
    return { field: "unknown", message: msg };
  }

  const firstWord = msg.slice(0, spaceIndex);

  if (msg.startsWith("property ")) {
    const rest = msg.slice("property ".length);
    const fieldEnd = rest.indexOf(" ");
    const field = fieldEnd > 0 ? rest.slice(0, fieldEnd) : rest;
    return { field, message: "This field is not allowed" };
  }

  return { field: firstWord, message: msg };
}

function extractIp(req: Request): string | undefined {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    const first = forwarded.split(",")[0];
    return first ? first.trim() : undefined;
  }
  return req.ip ?? req.socket.remoteAddress;
}
