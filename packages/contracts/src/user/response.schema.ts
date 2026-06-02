import { z } from 'zod'
import { createCursorPaginatedResponseSchema } from '../pagination/cursor.schema'

export const UserSummarySchema = z.object({
  id: z.string(),
  display_name: z.string(),
  nickname: z.string(),
  bio: z.string().nullable(),
  avatarObjectKey: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.iso.datetime(),
})

export type UserSummaryResponse = z.infer<typeof UserSummarySchema>

export const UserListResponseSchema = createCursorPaginatedResponseSchema(UserSummarySchema)

export type UserListResponse = z.infer<typeof UserListResponseSchema>

export const UserDetailResponseSchema = UserSummarySchema

export type UserDetailResponse = z.infer<typeof UserDetailResponseSchema>
