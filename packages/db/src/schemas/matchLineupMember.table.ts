import type { LineupMemberRole } from '@repo/domain'
import { BaseAttributeSchema, DbId } from '../common/schema.common'

export interface MatchLineupMemberTable extends BaseAttributeSchema {
  id: DbId
  lineup_id: string
  user_id: string
  role: LineupMemberRole
}
