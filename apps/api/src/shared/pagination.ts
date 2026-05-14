/**
 * Pagination helpers for API list endpoints.
 *
 * Provides a consistent pagination contract aligned
 * with @auryn/types PaginatedResponse<T>.
 */

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function normalizePagination(params: PaginationParams): {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
} {
  const page = Math.max(params.page ?? DEFAULT_PAGE, 1);
  const pageSize = Math.min(Math.max(params.pageSize ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  };
}
