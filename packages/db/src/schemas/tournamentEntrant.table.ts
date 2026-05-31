import type { EntrantStatus, EntrantType } from '@repo/domain'
import { BaseAttributeSchema, DbId, NullableColumn } from '../common/schema.common'

export interface TournamentEntrantTable extends BaseAttributeSchema {
  id: DbId
  tournament_id: string
  entrant_type: EntrantType
  entrant_id: string
  status: EntrantStatus
  seed: NullableColumn<number>
}
