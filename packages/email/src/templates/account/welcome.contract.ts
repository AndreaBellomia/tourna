import { z } from 'zod'

export const welcomeEmailSchema = z.object({
  displayName: z.string().min(1).max(120),
  dashboardUrl: z.string().url(),
})

export type WelcomeEmailProps = z.infer<typeof welcomeEmailSchema>
