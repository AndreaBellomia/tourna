import type { MembershipRoleCode, MembershipScope, MembershipStatus } from '@repo/domain'
import { BaseAttributeSchema, DbId, NullableColumn } from '../common/schema.common'

export interface MembershipTable extends BaseAttributeSchema {
  id: DbId
  user_id: string
  scope_type: MembershipScope
  scope_id: NullableColumn<string>
  role_code: MembershipRoleCode
  status: MembershipStatus
}
