import type { EventType, LifecycleStatus, Visibility } from '@repo/domain'
import { BaseAttributeSchema, DbId, NullableColumn } from '../common/schema.common'

export interface EventTable extends BaseAttributeSchema {
  id: DbId
  organization_id: NullableColumn<string>
  created_by_user_id: string
  name: string
  slug: string
  description: NullableColumn<string>
  type: EventType
  status: LifecycleStatus
  visibility: Visibility
  starts_at: NullableColumn<Date>
  ends_at: NullableColumn<Date>
}
