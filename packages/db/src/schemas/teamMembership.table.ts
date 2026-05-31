import type { MembershipStatus, TeamMembershipRole } from '@repo/domain'
import { BaseAttributeSchema, DbId, NullableColumn } from '../common/schema.common'

export interface TeamMembershipTable extends BaseAttributeSchema {
  id: DbId
  team_id: string
  user_id: string
  role: TeamMembershipRole
  status: MembershipStatus
  joined_at: Date
  left_at: NullableColumn<Date>
}
