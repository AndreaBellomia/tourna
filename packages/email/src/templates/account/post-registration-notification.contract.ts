import { z } from 'zod'

export const postRegistrationNotificationEmailSchema = z.object({
  displayName: z.string().min(1).max(120),
  email: z.string().email(),
  verificationUrl: z.string().url(),
})

export type PostRegistrationNotificationEmailProps = z.infer<
  typeof postRegistrationNotificationEmailSchema
>
