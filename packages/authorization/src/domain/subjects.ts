import { subject } from '@casl/ability'
import { Subject } from './permissions'

export type TeamSubjectAttributes = {
  id: string
  organizationId: string | null
}

export type UserSubjectAttributes = {
  teamId?: string
}

export const teamSubject = (attributes: TeamSubjectAttributes) =>
  subject(Subject.Team, attributes)

export const userSubject = (attributes: UserSubjectAttributes) =>
  subject(Subject.User, attributes)
