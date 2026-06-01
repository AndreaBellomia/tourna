import { VisibilitySchema } from '@repo/domain'
import { z } from 'zod'
import { CursorPaginationQuerySchema } from '../pagination/cursor.schema'

export const CreateTeamRequestSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  visibility: VisibilitySchema,
})

export type CreateTeamInput = z.infer<typeof CreateTeamRequestSchema>

export const TeamListQuerySchema = CursorPaginationQuerySchema.extend({
  search: z.string().trim().min(1).max(80).optional(),
  visibility: VisibilitySchema.optional(),
})

export type TeamListQuery = z.infer<typeof TeamListQuerySchema>
