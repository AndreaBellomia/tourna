import type { ResultConfirmationStatus } from '@repo/domain'
import { BaseAttributeSchema, DbId, NullableColumn } from '../common/schema.common'

export interface ResultConfirmationTable extends BaseAttributeSchema {
  id: DbId
  submission_id: string
  entrant_id: string
  confirmed_by_user_id: string
  status: ResultConfirmationStatus
  note: NullableColumn<string>
}
