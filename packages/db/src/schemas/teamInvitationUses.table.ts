import { BaseAttributeSchema, DbId } from '../common/schema.common'

export interface TeamInvitationUsesTable extends BaseAttributeSchema {
  team_invitation_id: string
  user_id: string
}
