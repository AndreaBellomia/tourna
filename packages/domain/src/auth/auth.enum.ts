import { z } from 'zod'

export const MEMBERSHIP_SCOPES = ['global', 'team', 'tournament'] as const

export const MembershipScopeSchema = z.enum(MEMBERSHIP_SCOPES)

export type MembershipScope = z.infer<typeof MembershipScopeSchema>

export const USER_ROLES = ['admin', 'organizer', 'team_manager', 'player'] as const

export const UserRoleSchema = z.enum(USER_ROLES)

export type UserRole = z.infer<typeof UserRoleSchema>
