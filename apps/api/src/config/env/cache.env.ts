import { z } from 'zod'

export const cacheEnvSchema = z.object({
  CACHE_DURATION_AUTHORIZATION: z.coerce.number().default(300),
  CACHE_DURATION_API_RESPONSE: z.coerce.number().default(300),
})

export type CacheEnv = z.infer<typeof cacheEnvSchema>
