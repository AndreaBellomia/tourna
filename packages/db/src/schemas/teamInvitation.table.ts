import { TeamInvitationStatus, TeamMembershipRole } from '@repo/domain'
import { BaseAttributeSchema, DbId, NullableColumn } from '../common/schema.common'

export interface TeamInvitationTable extends BaseAttributeSchema {
  id: DbId
  team_id: string
  code_hash: string
  created_by: string
  assigned_to: NullableColumn<string>
  role: TeamMembershipRole
  max_uses: NullableColumn<number>
  used_count: number
  expires_at: NullableColumn<Date>
  status: TeamInvitationStatus
}
