export interface PaginationMeta {
  page: number;
  limit: number;
  total_records: number;
  total_pages: number;
  next_page: number | null;
  previous_page: number | null;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export function calculatePagination(
  total_records: number,
  page: number,
  limit: number,
): PaginationMeta {
  const total_pages = Math.ceil(total_records / limit);
  const next_page = page < total_pages ? page + 1 : null;
  const previous_page = page > 1 ? page - 1 : null;

  return { page, limit, total_records, total_pages, next_page, previous_page };
}
