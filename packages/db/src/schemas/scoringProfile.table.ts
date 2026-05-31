import type { ScoringMode } from '@repo/domain'
import { BaseAttributeSchema, DbId, JsonColumn, NullableColumn } from '../common/schema.common'

export interface ScoringProfileTable extends BaseAttributeSchema {
  id: DbId
  organization_id: NullableColumn<string>
  created_by_user_id: string
  name: string
  mode: ScoringMode
  config: JsonColumn
}
