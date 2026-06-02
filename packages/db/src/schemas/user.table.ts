import { BaseAttributeSchema, DbId, NullableColumn } from '../common/schema.common'

export interface UserTable extends BaseAttributeSchema {
  id: DbId
  email: string
  display_name: string
  bio: NullableColumn<string>
  avatar_object_key: NullableColumn<string>
  password_hash: string
  deleted_at: NullableColumn<Date>
}
