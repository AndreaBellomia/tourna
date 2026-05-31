import { BaseAttributeSchema, DbId, NullableColumn } from '../common/schema.common'

export interface UserTable extends BaseAttributeSchema {
  id: DbId
  email: string
  display_name: string
  password_hash: string
  deleted_at: NullableColumn<Date>
}
