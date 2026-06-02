import { z } from 'zod'
import { CursorPaginationQuerySchema } from '../pagination/cursor.schema'

export const UserListQuerySchema = CursorPaginationQuerySchema.extend({
  search: z.string().trim().min(1).max(80).optional(),
})

export type UserListQuery = z.infer<typeof UserListQuerySchema>
