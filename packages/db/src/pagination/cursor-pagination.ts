import type { SelectQueryBuilder } from 'kysely'
import { decodeCursor } from './cursor-codec'
import { InvalidCursorError } from './cursor-error'
import { normalizeFilters, sameFilters } from './cursor-filters'
import { executeCursorQuery } from './cursor-query'
import { encodeCursorFromRow } from './cursor-row'
import type { CursorPaginatedResult, PaginateCursorOptions } from './cursor-types'

export { decodeCursor, encodeCursor } from './cursor-codec'
export { InvalidCursorError } from './cursor-error'
export type {
  CursorConfig,
  CursorDirection,
  CursorFieldValue,
  CursorFilters,
  CursorJsonValue,
  CursorOrderDirection,
  CursorPageInfo,
  CursorPaginatedResult,
  CursorPaginationInput,
  CursorPayload,
  PaginateCursorOptions,
} from './cursor-types'

export async function paginateCursor<DB, TB extends keyof DB, TRow extends object, TItem = TRow>(
  query: SelectQueryBuilder<DB, TB, TRow>,
  options: PaginateCursorOptions<TRow, TItem>,
): Promise<CursorPaginatedResult<TItem>> {
  if (options.pagination.limit < 1) {
    throw new RangeError('Cursor pagination limit must be greater than zero')
  }

  const direction = options.pagination.direction
  const filters = normalizeFilters(options.filters)
  const cursor = options.pagination.cursor ? decodeCursor(options.pagination.cursor) : null

  if (cursor && !sameFilters(cursor.filters, filters)) {
    throw new InvalidCursorError('Pagination cursor does not match current filters')
  }

  const rows = await executeCursorQuery(query, {
    cursor: options.cursor,
    payload: cursor,
    direction,
    limit: options.pagination.limit,
  })

  const hasExtraRow = rows.length > options.pagination.limit
  const pageWindow = rows.slice(0, options.pagination.limit)
  const dataRows = direction === 'prev' ? [...pageWindow].reverse() : pageWindow
  const hasNextPage = direction === 'next' ? hasExtraRow : cursor !== null
  const hasPreviousPage = direction === 'next' ? cursor !== null : hasExtraRow
  const mapItem = options.mapItem ?? ((row: TRow) => row as unknown as TItem)

  return {
    data: dataRows.map(mapItem),
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      nextCursor:
        hasNextPage && dataRows.length > 0
          ? encodeCursorFromRow(lastItem(dataRows), options.cursor, filters)
          : null,
      previousCursor:
        hasPreviousPage && dataRows.length > 0
          ? encodeCursorFromRow(firstItem(dataRows), options.cursor, filters)
          : null,
    },
  }
}

function firstItem<TItem>(items: TItem[]): TItem {
  const item = items[0]

  if (item === undefined) {
    throw new RangeError('Expected at least one item')
  }

  return item
}

function lastItem<TItem>(items: TItem[]): TItem {
  const item = items[items.length - 1]

  if (item === undefined) {
    throw new RangeError('Expected at least one item')
  }

  return item
}
