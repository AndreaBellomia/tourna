import { LifecycleStatusSchema, TeamMembershipRoleSchema, VisibilitySchema } from '@repo/domain'
import { z } from 'zod'
import { createCursorPaginatedResponseSchema } from '../pagination/cursor.schema'

export const TeamSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  status: LifecycleStatusSchema,
  visibility: VisibilitySchema,
  description: z.string().nullable(),
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

export const TeamDetailResponseSchema = TeamSummarySchema.extend({
  viewerMembership: TeamViewerMembershipSchema.nullable(),
})

export type TeamDetailResponse = z.infer<typeof TeamDetailResponseSchema>
