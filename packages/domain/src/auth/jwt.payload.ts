import z from 'zod'

export const jwtPayloadSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
})

export type JwtPayload = z.infer<typeof jwtPayloadSchema>
