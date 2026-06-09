import { ColumnType } from 'kysely'
import { BaseAttributeSchema, DbId, NullableColumn } from '../common/schema.common'

export interface UserTable extends BaseAttributeSchema {
  id: DbId
  email: string
  email_verified: ColumnType<boolean, boolean | undefined, boolean>
  display_name: string
  nickname: string
  bio: NullableColumn<string>
  avatar_object_key: NullableColumn<string>
  password_hash: string
  deleted_at: NullableColumn<Date>
}
