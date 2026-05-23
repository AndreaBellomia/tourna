import { z } from 'zod'

export const authEnvSchema = z.object({
  SESSION_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 60 * 24 * 7), // 7 days

  SCRYPT_KEYLEN: z.coerce.number().int().positive().default(64),

  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 15), // 15 minutes
})

export type AuthEnv = z.infer<typeof authEnvSchema>
