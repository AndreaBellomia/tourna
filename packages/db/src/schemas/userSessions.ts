import { ColumnType } from 'kysely'

export interface UserSessionTable {
  sessionId: ColumnType<string, never, never>
  userId: string
  expiresAt: Date
  ip?: string | null
  userAgent?: string | null
}
