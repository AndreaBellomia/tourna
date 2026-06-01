import { InvalidCursorError } from './cursor-error'
import { isCursorJsonValue, isRecord } from './cursor-filters'
import type { CursorPayload } from './cursor-types'

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

export function decodeCursor(cursor: string): CursorPayload {
  let payload: unknown

  try {
    payload = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'))
  } catch {
    throw new InvalidCursorError()
  }

  if (!isCursorPayload(payload)) {
    throw new InvalidCursorError()
  }

  return payload
}

function isCursorPayload(value: unknown): value is CursorPayload {
  if (!isRecord(value)) {
    return false
  }

  return (
    value.v === 1 &&
    (typeof value.fieldValue === 'string' || typeof value.fieldValue === 'number') &&
    typeof value.id === 'string' &&
    isRecord(value.filters) &&
    Object.values(value.filters).every(isCursorJsonValue)
  )
}
