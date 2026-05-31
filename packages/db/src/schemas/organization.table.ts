import type { LifecycleStatus, OrganizationType, Visibility } from '@repo/domain'
import { BaseAttributeSchema, DbId, NullableColumn } from '../common/schema.common'

export interface OrganizationTable extends BaseAttributeSchema {
  id: DbId
  created_by_user_id: string
  name: string
  slug: string
  type: OrganizationType
  status: LifecycleStatus
  visibility: Visibility
  description: NullableColumn<string>
}
