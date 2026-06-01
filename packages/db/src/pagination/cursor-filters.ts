import { InvalidCursorError } from './cursor-error'
import type { CursorFilters, CursorJsonValue } from './cursor-types'

export function normalizeFilters(filters: object | undefined): CursorFilters {
  if (!filters) {
    return {}
  }

  return normalizeRecord(filters)
}

export function sameFilters(left: CursorFilters, right: CursorFilters): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function isCursorJsonValue(value: unknown): value is CursorJsonValue {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null
  ) {
    return true
  }

  if (Array.isArray(value)) {
    return value.every(isCursorJsonValue)
  }

  if (isRecord(value)) {
    return Object.values(value).every(isCursorJsonValue)
  }

  return false
}

function normalizeRecord(record: object): CursorFilters {
  return Object.fromEntries(
    Object.entries(record)
      .filter(([, value]) => value !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => [key, normalizeJsonValue(value)]),
  )
}

function normalizeJsonValue(value: unknown): CursorJsonValue {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'boolean') {
    return value
  }

  if (value === null) {
    return null
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (Array.isArray(value)) {
    return value.map(normalizeJsonValue)
  }

  if (isRecord(value)) {
    return normalizeRecord(value)
  }

  throw new InvalidCursorError('Cursor filters must be JSON serializable')
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
