import type { StatValueType } from '@repo/domain'
import { BaseAttributeSchema, DbId, NullableColumn } from '../common/schema.common'

export interface StatDefinitionTable extends BaseAttributeSchema {
  id: DbId
  discipline_id: NullableColumn<string>
  code: string
  name: string
  description: NullableColumn<string>
  value_type: StatValueType
}
