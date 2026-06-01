import { type SelectQueryBuilder, sql } from 'kysely'
import type {
  CursorConfig,
  CursorDirection,
  CursorOrderDirection,
  CursorPayload,
} from './cursor-types'

type ApplyCursorQueryOptions<TRow extends object> = {
  cursor: CursorConfig<TRow>
  payload: CursorPayload | null
  direction: CursorDirection
  limit: number
}

export async function executeCursorQuery<DB, TB extends keyof DB, TRow extends object>(
  query: SelectQueryBuilder<DB, TB, TRow>,
  options: ApplyCursorQueryOptions<TRow>,
): Promise<TRow[]> {
  const cursorDirection = options.cursor.direction ?? 'desc'
  const orderDirection =
    options.direction === 'prev' ? invertDirection(cursorDirection) : cursorDirection
  const pageQuery = options.payload
    ? applyCursorWhere(query, options.cursor, options.payload, options.direction, cursorDirection)
    : query

  return await pageQuery
    .orderBy(sql.ref(options.cursor.column), orderDirection)
    .orderBy(sql.ref(options.cursor.idColumn), orderDirection)
    .limit(options.limit + 1)
    .execute()
}

function applyCursorWhere<DB, TB extends keyof DB, TRow extends object>(
  query: SelectQueryBuilder<DB, TB, TRow>,
  cursor: CursorConfig<TRow>,
  payload: CursorPayload,
  direction: CursorDirection,
  cursorDirection: CursorOrderDirection,
): SelectQueryBuilder<DB, TB, TRow> {
  const operator = seekOperator(cursorDirection, direction)
  const column = sql.ref(cursor.column)
  const idColumn = sql.ref(cursor.idColumn)

  if (operator === '<') {
    return query.where(sql<boolean>`
      ${column} < ${payload.fieldValue}
      or (${column} = ${payload.fieldValue} and ${idColumn} < ${payload.id})
    `)
  }

  return query.where(sql<boolean>`
    ${column} > ${payload.fieldValue}
    or (${column} = ${payload.fieldValue} and ${idColumn} > ${payload.id})
  `)
}

function seekOperator(
  cursorDirection: CursorOrderDirection,
  pageDirection: CursorDirection,
): '<' | '>' {
  const nextOperator = cursorDirection === 'desc' ? '<' : '>'

  if (pageDirection === 'next') {
    return nextOperator
  }

  return nextOperator === '<' ? '>' : '<'
}

function invertDirection(direction: CursorOrderDirection): CursorOrderDirection {
  return direction === 'asc' ? 'desc' : 'asc'
}
