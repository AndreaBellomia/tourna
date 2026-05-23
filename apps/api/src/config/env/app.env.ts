import { z } from 'zod'

export const appEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().default(3001),

  GLOBAL_PREFIX: z.string().default('api'),
})

export type AppEnv = z.infer<typeof appEnvSchema>
