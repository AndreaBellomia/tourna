import z from 'zod'

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  sessionId: z.string(),
})

export type AuthResponse = z.infer<typeof AuthResponseSchema>

export const VerifyEmailResponseSchema = z.object({
  verified: z.boolean(),
})

export type VerifyEmailResponse = z.infer<typeof VerifyEmailResponseSchema>
