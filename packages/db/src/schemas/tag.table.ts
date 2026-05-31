import { BaseAttributeSchema, DbId } from '../common/schema.common'

export interface TagTable extends BaseAttributeSchema {
  id: DbId
  label: string
  slug: string
}
