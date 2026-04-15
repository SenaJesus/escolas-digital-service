export const DEFAULT_PAGE_SIZE = 30
export const MAX_PAGE_SIZE = 100

export type PaginationParams = {
  page: number
  pageSize: number
}

export type PaginatedResult<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const parsePagination = (query: Record<string, unknown>): PaginationParams => {
  const pageRaw = Number(query.page ?? 1)
  const sizeRaw = Number(query.page_size ?? DEFAULT_PAGE_SIZE)

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1
  const pageSize =
    Number.isFinite(sizeRaw) && sizeRaw > 0
      ? Math.min(Math.floor(sizeRaw), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE

  return { page, pageSize }
}

export const buildPageUrl = (
  baseUrl: string,
  page: number,
  pageSize: number,
  extraParams: Record<string, string | undefined>,
): string => {
  const url = new URL(baseUrl)
  url.searchParams.set('page', String(page))

  if (pageSize !== DEFAULT_PAGE_SIZE)
    url.searchParams.set('page_size', String(pageSize))

  for (const [k, v] of Object.entries(extraParams)) {
    if (v !== undefined && v !== '') url.searchParams.set(k, v)
  }

  return url.toString()
}
