import type { ResultSubmissionStatus, ResultSubmitterType } from '@repo/domain'
import { BaseAttributeSchema, DbId, JsonColumn, NullableColumn } from '../common/schema.common'

export interface ResultSubmissionTable extends BaseAttributeSchema {
  id: DbId
  match_id: string
  submitted_by_user_id: string
  submitted_by_type: ResultSubmitterType
  entrant_id: NullableColumn<string>
  status: ResultSubmissionStatus
  payload: JsonColumn
}
