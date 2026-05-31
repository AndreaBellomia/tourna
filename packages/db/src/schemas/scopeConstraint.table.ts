import type { ConstraintScope, ConstraintType } from '@repo/domain'
import { BaseAttributeSchema, DbId, JsonColumn } from '../common/schema.common'

export interface ScopeConstraintTable extends BaseAttributeSchema {
  id: DbId
  scope_type: ConstraintScope
  scope_id: string
  type: ConstraintType
  config: JsonColumn
}
