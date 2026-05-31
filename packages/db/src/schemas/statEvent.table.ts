import { BaseAttributeSchema, DbId, JsonColumn, NullableColumn } from '../common/schema.common'

export interface StatEventTable extends BaseAttributeSchema {
  id: DbId
  tournament_id: string
  match_id: string
  entrant_id: string
  user_id: NullableColumn<string>
  stat_definition_id: string
  numeric_value: NullableColumn<string>
  text_value: NullableColumn<string>
  boolean_value: NullableColumn<boolean>
  duration_ms: NullableColumn<number>
  metadata: JsonColumn
}
