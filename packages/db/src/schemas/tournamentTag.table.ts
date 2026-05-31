import { BaseAttributeSchema, DbId } from '../common/schema.common'

export interface TournamentTagTable extends BaseAttributeSchema {
  id: DbId
  tournament_id: string
  tag_id: string
}
