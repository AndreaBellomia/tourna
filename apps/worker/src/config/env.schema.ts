import { z } from 'zod'

const booleanEnv = (defaultValue: boolean) =>
  z
    .preprocess((value) => {
      if (typeof value === 'boolean') {
        return value
      }

      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase()

        if (['true', '1', 'yes', 'on'].includes(normalized)) {
          return true
        }

        if (['false', '0', 'no', 'off', ''].includes(normalized)) {
          return false
        }
      }

      return value
    }, z.boolean())
    .default(defaultValue)

const optionalNonEmptyStringEnv = () =>
  z.preprocess((value) => (value === '' ? undefined : value), z.string().min(1).optional())

export const workerEnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().default(''),
    REDIS_DB: z.coerce.number().default(0),
    STORAGE_ENDPOINT: z.string().url().default('http://localhost:9000'),
    STORAGE_REGION: z.string().default('us-east-1'),
    STORAGE_ACCESS_KEY_ID: z.string().default('tourna'),
    STORAGE_SECRET_ACCESS_KEY: z.string().default('tourna-secret'),
    STORAGE_FORCE_PATH_STYLE: booleanEnv(true),
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
    EMAIL_SMTP_SECURE: booleanEnv(false),
    EMAIL_SMTP_USER: z.string().optional(),
    EMAIL_SMTP_PASSWORD: z.string().optional(),
    EMAIL_DEFAULT_FROM: z.string().email().default('noreply@tourna.local'),
    EMAIL_DEFAULT_REPLY_TO: z.string().email().default('support@tourna.local'),
    WORKER_NOTIFICATIONS_CONCURRENCY: z.coerce.number().int().positive().default(5),
    WORKER_REPORTS_CONCURRENCY: z.coerce.number().int().positive().default(2),
    WORKER_RATINGS_CONCURRENCY: z.coerce.number().int().positive().default(2),
    WORKER_MAINTENANCE_CONCURRENCY: z.coerce.number().int().positive().default(1),
    WORKER_REGISTER_CRON: booleanEnv(true),
    WORKER_BULL_BOARD_ENABLED: booleanEnv(false),
    WORKER_BULL_BOARD_HOST: z.string().default('127.0.0.1'),
    WORKER_BULL_BOARD_PORT: z.coerce.number().int().positive().max(65_535).default(3031),
    WORKER_BULL_BOARD_BASE_PATH: z
      .string()
      .regex(/^\/[A-Za-z0-9/_-]*$/)
      .default('/admin/queues'),
    WORKER_BULL_BOARD_READ_ONLY: booleanEnv(false),
    WORKER_BULL_BOARD_USERNAME: optionalNonEmptyStringEnv(),
    WORKER_BULL_BOARD_PASSWORD: optionalNonEmptyStringEnv(),
  })
  .superRefine((env, context) => {
    const hasUsername = Boolean(env.WORKER_BULL_BOARD_USERNAME)
    const hasPassword = Boolean(env.WORKER_BULL_BOARD_PASSWORD)

    if (hasUsername !== hasPassword) {
      context.addIssue({
        code: 'custom',
        message:
          'WORKER_BULL_BOARD_USERNAME and WORKER_BULL_BOARD_PASSWORD must be provided together',
        path: ['WORKER_BULL_BOARD_USERNAME'],
      })
    }

    const isLocalHost = ['127.0.0.1', 'localhost', '::1'].includes(env.WORKER_BULL_BOARD_HOST)
    const requiresAuth =
      env.WORKER_BULL_BOARD_ENABLED && (env.NODE_ENV === 'production' || !isLocalHost)

    if (requiresAuth && (!hasUsername || !hasPassword)) {
      context.addIssue({
        code: 'custom',
        message:
          'Bull Board requires WORKER_BULL_BOARD_USERNAME and WORKER_BULL_BOARD_PASSWORD in production or when bound outside localhost',
        path: ['WORKER_BULL_BOARD_USERNAME'],
      })
    }
  })

export type WorkerEnv = z.infer<typeof workerEnvSchema>
