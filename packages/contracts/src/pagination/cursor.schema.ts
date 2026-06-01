import { z } from 'zod'

export const CursorDirectionSchema = z.enum(['next', 'prev'])

export type CursorDirection = z.infer<typeof CursorDirectionSchema>

export const CursorPaginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().trim().min(1).optional(),
  direction: CursorDirectionSchema.default('next'),
})

export type CursorPaginationQuery = z.infer<typeof CursorPaginationQuerySchema>

export const CursorPageInfoSchema = z.object({
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
  nextCursor: z.string().nullable(),
  previousCursor: z.string().nullable(),
})

export type CursorPageInfo = z.infer<typeof CursorPageInfoSchema>

export const createCursorPaginatedResponseSchema = <TItemSchema extends z.ZodType>(
  itemSchema: TItemSchema,
) =>
  z.object({
    data: z.array(itemSchema),
    pageInfo: CursorPageInfoSchema,
  })

export type CursorPaginatedResponse<TItem> = {
  data: TItem[]
  pageInfo: CursorPageInfo
}
