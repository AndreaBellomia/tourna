import type { RosterStatus } from '@repo/domain'
import { BaseAttributeSchema, DbId, NullableColumn } from '../common/schema.common'

export interface TournamentRosterTable extends BaseAttributeSchema {
  id: DbId
  tournament_id: string
  entrant_id: string
  name: NullableColumn<string>
  status: RosterStatus
}
