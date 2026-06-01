import { VisibilitySchema } from '@repo/domain'
import { z } from 'zod'
import { CursorPaginationQuerySchema } from '../pagination/cursor.schema'

export const CreateTeamRequestSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(3000).optional(),
  visibility: VisibilitySchema,
})

export type CreateTeamInput = z.infer<typeof CreateTeamRequestSchema>

export const UpdateTeamRequestSchema = CreateTeamRequestSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one team field is required',
)

export type UpdateTeamInput = z.infer<typeof UpdateTeamRequestSchema>

export const TeamListQuerySchema = CursorPaginationQuerySchema.extend({
  search: z.string().trim().min(1).max(80).optional(),
  visibility: VisibilitySchema.optional(),
})

export type TeamListQuery = z.infer<typeof TeamListQuerySchema>
