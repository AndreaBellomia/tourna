import {
  LifecycleStatusSchema,
  TeamInvitationStatusSchema,
  TeamMembershipRoleSchema,
  VisibilitySchema,
} from '@repo/domain'
import { z } from 'zod'
import { createCursorPaginatedResponseSchema } from '../pagination/cursor.schema'

export const TeamSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  tag: z.string(),
  status: LifecycleStatusSchema,
  visibility: VisibilitySchema,
  description: z.string().nullable(),
  logoObjectKey: z.string().nullable(),
  logoUrl: z.string().url().nullable(),
  createdAt: z.iso.datetime(),
})

export type TeamSummaryResponse = z.infer<typeof TeamSummarySchema>

export const TeamListResponseSchema = createCursorPaginatedResponseSchema(TeamSummarySchema)

export type TeamListResponse = z.infer<typeof TeamListResponseSchema>

export const TeamViewerMembershipSchema = z.object({
  role: TeamMembershipRoleSchema,
  canManage: z.boolean(),
})

export type TeamViewerMembershipResponse = z.infer<typeof TeamViewerMembershipSchema>

export const TeamMemberProfileSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  nickname: z.string(),
  avatarObjectKey: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
})

export const TeamMemberSchema = z.object({
  role: TeamMembershipRoleSchema,
  joinedAt: z.iso.datetime(),
  user: TeamMemberProfileSchema,
})

export type TeamMemberResponse = z.infer<typeof TeamMemberSchema>

export const TeamDetailResponseSchema = TeamSummarySchema.extend({
  viewerMembership: TeamViewerMembershipSchema.nullable(),
  members: z.array(TeamMemberSchema),
})

export type TeamDetailResponse = z.infer<typeof TeamDetailResponseSchema>

export const TeamInvitationCreateResponseSchema = z.object({
  code: z.string(),
  teamId: z.string(),
  role: TeamMembershipRoleSchema,
  maxUses: z.number().int().positive().nullable(),
  expiresAt: z.iso.datetime(),
})

export type TeamInvitationCreateResponse = z.infer<typeof TeamInvitationCreateResponseSchema>

export const TeamInvitationAcceptResponseSchema = z.object({
  teamId: z.string(),
})

export type TeamInvitationAcceptResponse = z.infer<typeof TeamInvitationAcceptResponseSchema>

export const TeamInvitationResponseSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  role: TeamMembershipRoleSchema,
  assignedTo: z.string().nullable(),
  maxUses: z.number().int().positive().nullable(),
  usedCount: z.number().int().nonnegative(),
  expiresAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  status: TeamInvitationStatusSchema,
})

export type TeamInvitationResponse = z.infer<typeof TeamInvitationResponseSchema>

export const TeamInvitationListResponseSchema = createCursorPaginatedResponseSchema(
  TeamInvitationResponseSchema,
)

export type TeamInvitationListResponse = z.infer<typeof TeamInvitationListResponseSchema>
