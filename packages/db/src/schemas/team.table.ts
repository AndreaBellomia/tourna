import type { LifecycleStatus, Visibility } from '@repo/domain'
import { BaseAttributeSchema, DbId, NullableColumn } from '../common/schema.common'

export interface TeamTable extends BaseAttributeSchema {
  id: DbId
  created_by_user_id: string
  organization_id: NullableColumn<string>
  name: string
  slug: string
  status: LifecycleStatus
  visibility: Visibility
  description: NullableColumn<string>
}
