import { z } from 'zod'

export const taskEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default(''),
  REDIS_DB: z.coerce.number().default(0),
  STORAGE_ENDPOINT: z.string().url().default('http://localhost:9000'),
  STORAGE_REGION: z.string().default('us-east-1'),
  STORAGE_ACCESS_KEY_ID: z.string().default('tourna'),
  STORAGE_SECRET_ACCESS_KEY: z.string().default('tourna-secret'),
  STORAGE_FORCE_PATH_STYLE: z.coerce.boolean().default(true),
  STORAGE_PUBLIC_BUCKET: z.string().default('tourna-public-assets'),
  STORAGE_PRIVATE_BUCKET: z.string().default('tourna-private-assets'),
  STORAGE_PUBLIC_BASE_URL: z.string().url().optional(),
  STORAGE_UPLOAD_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60),
  STORAGE_READ_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(5 * 60),
  EMAIL_SMTP_HOST: z.string().default('localhost'),
  EMAIL_SMTP_PORT: z.coerce.number().default(1025),
  EMAIL_SMTP_SECURE: z.coerce.boolean().default(false),
  EMAIL_SMTP_USER: z.string().optional(),
  EMAIL_SMTP_PASSWORD: z.string().optional(),
  EMAIL_DEFAULT_FROM: z.string().email().default('noreply@tourna.local'),
  EMAIL_DEFAULT_REPLY_TO: z.string().email().default('support@tourna.local'),
})

export type TaskEnv = z.infer<typeof taskEnvSchema>

let cachedEnv: TaskEnv | undefined

export function getTaskEnv(): TaskEnv {
  cachedEnv ??= taskEnvSchema.parse(process.env)
  return cachedEnv
}

