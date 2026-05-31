import z from 'zod'
import { appEnvSchema } from './env/app.env'
import { databaseEnvSchema } from './env/database.env'
import { redisEnvSchema } from './env/redis.env'
import { authEnvSchema } from './env/auth.env'
import { cacheEnvSchema } from './env/cache.env'
import { storageEnvSchema } from './env/storage.env'

export const envSchema = z.object({
  ...appEnvSchema.shape,
  ...authEnvSchema.shape,
  ...cacheEnvSchema.shape,
  ...databaseEnvSchema.shape,
  ...redisEnvSchema.shape,
  ...storageEnvSchema.shape,
})

export type Env = z.infer<typeof envSchema>
