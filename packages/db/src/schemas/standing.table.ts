import { BaseAttributeSchema, DbId, JsonColumn, NullableColumn } from '../common/schema.common'

export interface StandingTable extends BaseAttributeSchema {
  id: DbId
  tournament_id: string
  stage_id: NullableColumn<string>
  entrant_id: string
  points: string
  wins: number
  draws: number
  losses: number
  played: number
  rank: NullableColumn<number>
  tiebreakers: JsonColumn
}
