import type {
  EvidencePolicy,
  LifecycleStatus,
  ParticipantMode,
  TournamentFormat,
  TournamentType,
  Visibility,
} from '@repo/domain'
import { BaseAttributeSchema, DbId, JsonColumn, NullableColumn } from '../common/schema.common'

export interface TournamentTable extends BaseAttributeSchema {
  id: DbId
  organization_id: NullableColumn<string>
  event_id: NullableColumn<string>
  created_by_user_id: string
  discipline_id: string
  scoring_profile_id: NullableColumn<string>
  name: string
  slug: string
  description: NullableColumn<string>
  type: TournamentType
  participant_mode: ParticipantMode
  format: TournamentFormat
  status: LifecycleStatus
  visibility: Visibility
  evidence_policy: EvidencePolicy
  settings: JsonColumn
  starts_at: NullableColumn<Date>
  ends_at: NullableColumn<Date>
}
