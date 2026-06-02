import z from 'zod'

export const ProfileSummaryResponseSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  nickname: z.string(),
  email: z.email(),
  bio: z.string().nullable(),
  avatarObjectKey: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
})

export type ProfileSummaryResponse = z.infer<typeof ProfileSummaryResponseSchema>
