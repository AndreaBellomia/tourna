import { TeamMembershipRoleSchema, VisibilitySchema } from '@repo/domain'
import { z } from 'zod'
import { CursorPaginationQuerySchema } from '../pagination/cursor.schema'

export const CreateTeamRequestSchema = z.object({
  name: z.string().min(3).max(50),
  tag: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{4}$/),
  description: z.string().max(3000).optional(),
  visibility: VisibilitySchema,
})

export type CreateTeamInput = z.infer<typeof CreateTeamRequestSchema>

export const UpdateTeamRequestSchema = CreateTeamRequestSchema.extend({
  logoObjectKey: z.string().trim().min(1).max(500).nullable().optional(),
})
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one team field is required')

export type UpdateTeamInput = z.infer<typeof UpdateTeamRequestSchema>

export const TeamListQuerySchema = CursorPaginationQuerySchema.extend({
  search: z.string().trim().min(1).max(80).optional(),
  visibility: VisibilitySchema.optional(),
})

export type TeamListQuery = z.infer<typeof TeamListQuerySchema>

export const TeamInvitationRequestSchema = z.object({
  role: TeamMembershipRoleSchema,
  expiresAt: z.iso.datetime().default(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString()
  }),
  maxUses: z.number().int().min(1).max(100),
})

export type TeamInvitationInput = z.infer<typeof TeamInvitationRequestSchema>

export const TeamInvitationCodeParamSchema = z.object({
  code: z.string().trim().min(8).max(32),
})

export type TeamInvitationCodeParam = z.infer<typeof TeamInvitationCodeParamSchema>

export const TeamRemoveUserRequestSchema = z.object({
  userId: z.string(),
})

export type TeamRemoveUserInput = z.infer<typeof TeamRemoveUserRequestSchema>
