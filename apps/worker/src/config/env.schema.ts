import { z } from 'zod'

export const workerEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default(''),
  REDIS_DB: z.coerce.number().default(0),
  EMAIL_SMTP_HOST: z.string().default('localhost'),
  EMAIL_SMTP_PORT: z.coerce.number().default(1025),
  EMAIL_SMTP_SECURE: z.coerce.boolean().default(false),
  EMAIL_SMTP_USER: z.string().optional(),
  EMAIL_SMTP_PASSWORD: z.string().optional(),
  EMAIL_DEFAULT_FROM: z.string().email().default('noreply@tourna.local'),
  EMAIL_DEFAULT_REPLY_TO: z.string().email().default('support@tourna.local'),
  WORKER_NOTIFICATIONS_CONCURRENCY: z.coerce.number().int().positive().default(5),
  WORKER_REPORTS_CONCURRENCY: z.coerce.number().int().positive().default(2),
  WORKER_RATINGS_CONCURRENCY: z.coerce.number().int().positive().default(2),
  WORKER_MAINTENANCE_CONCURRENCY: z.coerce.number().int().positive().default(1),
  WORKER_REGISTER_CRON: z.coerce.boolean().default(true),
})

export type WorkerEnv = z.infer<typeof workerEnvSchema>
