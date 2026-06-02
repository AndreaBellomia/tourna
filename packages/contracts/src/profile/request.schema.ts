import { z } from 'zod'

export const UpdateProfileRequestSchema = z
  .object({
    display_name: z.string().trim().min(2).max(80).optional(),
    nickname: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9][a-z0-9_-]{1,39}$/)
      .optional(),
    bio: z.string().max(3000).nullable().optional(),
    avatarObjectKey: z.string().trim().min(1).max(500).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one profile field is required')

export type UpdateProfileInput = z.infer<typeof UpdateProfileRequestSchema>
