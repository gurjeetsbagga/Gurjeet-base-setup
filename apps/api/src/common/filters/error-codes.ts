/**
 * Standardized error codes for the Auryn API.
 *
 * Clients can switch on `error.code` to handle errors programmatically
 * without parsing human-readable messages. New codes should be added
 * here as features are implemented.
 */
export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * Consistent error response sent to API clients.
 *
 * The `success: false` envelope aligns with the success response shape,
 * giving frontends a single discriminator to check.
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    statusCode: number;
    code: ErrorCode;
    message: string;
    errors?: FieldError[];
    requestId?: string;
    timestamp: string;
  };
}

export interface FieldError {
  field: string;
  message: string;
}
