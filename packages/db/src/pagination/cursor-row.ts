import { InvalidCursorError } from './cursor-error'
import { encodeCursor } from './cursor-codec'
import type { CursorConfig, CursorFieldValue, CursorFilters } from './cursor-types'

export function encodeCursorFromRow<TRow extends object>(
  row: TRow,
  cursor: CursorConfig<TRow>,
  filters: CursorFilters,
): string {
  return encodeCursor({
    v: 1,
    fieldValue: readFieldValue(row, cursor.outputKey),
    id: String(readRequiredValue(row, cursor.idOutputKey ?? 'id')),
    filters,
  })
}

function readFieldValue<TRow extends object>(
  row: TRow,
  key: Extract<keyof TRow, string>,
): CursorFieldValue {
  const value = readRequiredValue(row, key)

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }

  throw new InvalidCursorError('Cursor field must be a string, number, or Date')
}

function readRequiredValue(row: object, key: string): unknown {
  const value = (row as Record<string, unknown>)[key]

  if (value === undefined || value === null) {
    throw new InvalidCursorError(`Missing cursor value "${key}"`)
  }

  return value
}
