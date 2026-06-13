import { z } from 'zod'

export const TEAM_MEMBERSHIP_ROLES = [
  'owner',
  'captain',
  'player',
  'substitute',
  'coach',
  'manager',
] as const

export const TeamMembershipRoleSchema = z.enum(TEAM_MEMBERSHIP_ROLES)

export type TeamMembershipRole = z.infer<typeof TeamMembershipRoleSchema>

export const ROSTER_MEMBER_ROLES = ['starter', 'substitute', 'coach', 'manager'] as const

export const RosterMemberRoleSchema = z.enum(ROSTER_MEMBER_ROLES)

export type RosterMemberRole = z.infer<typeof RosterMemberRoleSchema>

export const LINEUP_MEMBER_ROLES = ['player', 'substitute', 'coach'] as const

export const LineupMemberRoleSchema = z.enum(LINEUP_MEMBER_ROLES)

export type LineupMemberRole = z.infer<typeof LineupMemberRoleSchema>

export const ROSTER_STATUSES = ['draft', 'submitted', 'approved', 'locked', 'rejected'] as const

export const RosterStatusSchema = z.enum(ROSTER_STATUSES)

export type RosterStatus = z.infer<typeof RosterStatusSchema>

export const TEAM_INVITATION_STATUSES = ['active', 'revoked'] as const

export const TeamInvitationStatusSchema = z.enum(TEAM_INVITATION_STATUSES)

export type TeamInvitationStatus = z.infer<typeof TeamInvitationStatusSchema>
