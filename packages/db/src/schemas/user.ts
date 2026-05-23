import { ColumnType } from 'kysely'
import { UserRole } from '@repo/domain'

export interface UserTable {
  id: ColumnType<string, never, never>
  email: string
  password_hash: string
  role: ColumnType<UserRole, UserRole | undefined, never>
  created_at: ColumnType<Date, never, never>
}
