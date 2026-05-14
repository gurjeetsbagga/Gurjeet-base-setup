/**
 * Standard API response wrappers.
 *
 * All endpoints return one of these shapes. The `success` discriminator
 * lets frontends use a single check:
 *
 *   if (res.success) {
 *     // res.data is available
 *   } else {
 *     // res.error has statusCode, code, message, errors
 *   }
 */

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export function successResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

export interface ApiPaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}

export function paginatedSuccessResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): ApiPaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination: {
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    },
  };
}
