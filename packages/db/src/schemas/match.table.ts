import type { MatchStatus, MatchType } from '@repo/domain'
import { BaseAttributeSchema, DbId, JsonColumn, NullableColumn } from '../common/schema.common'

export interface MatchTable extends BaseAttributeSchema {
  id: DbId
  tournament_id: string
  stage_id: NullableColumn<string>
  discipline_id: NullableColumn<string>
  type: MatchType
  status: MatchStatus
  order_index: NullableColumn<number>
  scheduled_at: NullableColumn<Date>
  started_at: NullableColumn<Date>
  completed_at: NullableColumn<Date>
  metadata: JsonColumn
}
