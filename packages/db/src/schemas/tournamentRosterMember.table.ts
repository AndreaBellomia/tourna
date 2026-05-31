import type { MembershipStatus, RosterMemberRole } from '@repo/domain'
import { BaseAttributeSchema, DbId } from '../common/schema.common'

export interface TournamentRosterMemberTable extends BaseAttributeSchema {
  id: DbId
  roster_id: string
  user_id: string
  role: RosterMemberRole
  status: MembershipStatus
}
