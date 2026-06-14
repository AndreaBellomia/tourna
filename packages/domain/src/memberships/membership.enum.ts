import { z } from 'zod'

export const MEMBERSHIP_SCOPES = ['global', 'organization', 'team', 'event', 'tournament'] as const

export const MembershipScopeSchema = z.enum(MEMBERSHIP_SCOPES)

export type MembershipScope = z.infer<typeof MembershipScopeSchema>

export const MEMBERSHIP_ROLE_CODES = [
  'global_admin',
  'org_owner',
  'org_admin',
  'org_moderator',
  'team_owner',
  'team_captain',
  'player',
  'coach',
  'manager',
] as const

export const MembershipRoleCodeSchema = z.enum(MEMBERSHIP_ROLE_CODES)

export type MembershipRoleCode = z.infer<typeof MembershipRoleCodeSchema>

export const MEMBERSHIP_STATUSES = ['active', 'suspended', 'left', 'removed'] as const

export const MembershipStatusSchema = z.enum(MEMBERSHIP_STATUSES)

export type MembershipStatus = z.infer<typeof MembershipStatusSchema>
