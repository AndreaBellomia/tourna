import { BaseAttributeSchema, DbId } from '../common/schema.common'

export interface MatchLineupTable extends BaseAttributeSchema {
  id: DbId
  match_id: string
  entrant_id: string
}
