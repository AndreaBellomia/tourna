import { BaseAttributeSchema, DbId, NullableColumn } from '../common/schema.common'

export interface TeamInvitationTable extends BaseAttributeSchema {
  id: DbId
  team_id: string
  expires_at: Date
  limited_uses: NullableColumn<number>
}
