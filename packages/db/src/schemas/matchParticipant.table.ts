import type { ParticipantResultStatus } from '@repo/domain'
import { BaseAttributeSchema, DbId, NullableColumn } from '../common/schema.common'

export interface MatchParticipantTable extends BaseAttributeSchema {
  id: DbId
  match_id: string
  entrant_id: string
  slot: number
  score: NullableColumn<string>
  placement: NullableColumn<number>
  is_winner: boolean
  result_status: ParticipantResultStatus
}
