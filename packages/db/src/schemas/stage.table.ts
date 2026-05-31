import type { LifecycleStatus, StageType } from '@repo/domain'
import { BaseAttributeSchema, DbId, JsonColumn, NullableColumn } from '../common/schema.common'

export interface StageTable extends BaseAttributeSchema {
  id: DbId
  tournament_id: string
  name: string
  type: StageType
  order_index: number
  status: LifecycleStatus
  settings: JsonColumn
  starts_at: NullableColumn<Date>
  ends_at: NullableColumn<Date>
}
