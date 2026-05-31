import { z } from 'zod'

export const workerEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default(''),
  REDIS_DB: z.coerce.number().default(0),
  WORKER_NOTIFICATIONS_CONCURRENCY: z.coerce.number().int().positive().default(5),
  WORKER_REPORTS_CONCURRENCY: z.coerce.number().int().positive().default(2),
  WORKER_RATINGS_CONCURRENCY: z.coerce.number().int().positive().default(2),
  WORKER_MAINTENANCE_CONCURRENCY: z.coerce.number().int().positive().default(1),
  WORKER_REGISTER_CRON: z.coerce.boolean().default(true),
})

export type WorkerEnv = z.infer<typeof workerEnvSchema>
