import type { DisciplineKind } from '@repo/domain'
import { BaseAttributeSchema, DbId, NullableColumn } from '../common/schema.common'

export interface DisciplineTable extends BaseAttributeSchema {
  id: DbId
  name: string
  slug: string
  kind: DisciplineKind
  description: NullableColumn<string>
}
