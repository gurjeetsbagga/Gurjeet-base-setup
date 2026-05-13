/**
 * Nominal / branded type — prevents accidental interchange of
 * structurally identical primitives (e.g. UserId vs ConversationId).
 *
 *   type UserId = Brand<string, "UserId">;
 */
declare const __brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [__brand]: B };

/** Make every property in T nullable. */
export type Nullable<T> = { [K in keyof T]: T[K] | null };

/** Extract the resolved type from a Promise. */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/** Require at least one of the given keys. */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

/** ISO-8601 date string (documentation alias). */
export type ISODateString = Brand<string, "ISODateString">;

/** Pagination envelope returned by list endpoints. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Standard API error shape. */
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: unknown;
}

/** Standard API success envelope. */
export interface ApiResponse<T> {
  success: true;
  data: T;
}
