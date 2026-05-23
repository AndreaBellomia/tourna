import { z } from 'zod'

export const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_NAME: z.string().default('postgres'),
  DATABASE_USER: z.string().default('postgres'),
  DATABASE_PASSWORD: z.string().default('postgres'),
  DATABASE_MAX: z.coerce.number().int().positive().default(10),
})

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>
