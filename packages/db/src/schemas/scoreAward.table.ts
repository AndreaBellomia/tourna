import type { ScoreAwardSourceType } from '@repo/domain'
import { BaseAttributeSchema, DbId, NullableColumn } from '../common/schema.common'

export interface ScoreAwardTable extends BaseAttributeSchema {
  id: DbId
  tournament_id: string
  match_id: NullableColumn<string>
  entrant_id: string
  source_type: ScoreAwardSourceType
  points: string
  reason: NullableColumn<string>
}
