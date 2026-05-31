import type { EvidenceType } from '@repo/domain'
import { BaseAttributeSchema, DbId, JsonColumn } from '../common/schema.common'

export interface ResultEvidenceTable extends BaseAttributeSchema {
  id: DbId
  submission_id: string
  uploaded_by_user_id: string
  type: EvidenceType
  url: string
  metadata: JsonColumn
}
