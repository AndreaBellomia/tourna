export type CursorDirection = 'next' | 'prev'

export type CursorOrderDirection = 'asc' | 'desc'

export type CursorFieldValue = string | number

export type CursorJsonValue =
  | string
  | number
  | boolean
  | null
  | CursorJsonValue[]
  | { [key: string]: CursorJsonValue }

export type CursorFilters = Record<string, CursorJsonValue>

export type CursorPaginationInput = {
  limit: number
  cursor?: string
  direction: CursorDirection
}

export type CursorPageInfo = {
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextCursor: string | null
  previousCursor: string | null
}

export type CursorPaginatedResult<TItem> = {
  data: TItem[]
  pageInfo: CursorPageInfo
}

export type CursorConfig<TRow extends object> = {
  column: string
  outputKey: Extract<keyof TRow, string>
  idColumn: string
  idOutputKey?: string
  direction?: CursorOrderDirection
}

export type CursorPayload = {
  v: 1
  fieldValue: CursorFieldValue
  id: string
  filters: CursorFilters
}

export type PaginateCursorOptions<TRow extends object, TItem> = {
  pagination: CursorPaginationInput
  filters?: object
  cursor: CursorConfig<TRow>
  mapItem?: (row: TRow) => TItem
}
