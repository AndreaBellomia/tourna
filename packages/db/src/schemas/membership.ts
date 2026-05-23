import { MembershipScope, UserRole } from '@repo/domain'
import { ColumnType } from 'kysely'

export interface MembershipTable {
  id: ColumnType<string, never, never>
  userId: string
  role: UserRole
  scopeType: MembershipScope
  scopeId?: string
}
