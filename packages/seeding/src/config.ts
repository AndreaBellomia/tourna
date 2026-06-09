import { z } from 'zod'
import type { CreateConnectionsOptions } from '@repo/db'
import type { RedisClientOptions } from '@repo/redis'

const integerString = z.coerce.number().int().positive()
const nonEmptyString = z.string().min(1)

const databaseUrlEnvSchema = z.object({
  DATABASE_URL: nonEmptyString,
})

const postgresEnvSchema = z.object({
  PGHOST: nonEmptyString,
  PGPORT: integerString.default(5432),
  PGDATABASE: nonEmptyString,
  PGUSER: nonEmptyString,
  PGPASSWORD: z.string().default(''),
})

const redisEnvSchema = z.object({
  REDIS_HOST: nonEmptyString.optional(),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().default(''),
  REDIS_DB: z.coerce.number().int().min(0).default(0),
})

export interface SeedEnvironmentConfig {
  database: CreateConnectionsOptions
  redis?: RedisClientOptions
}

export function loadSeedEnvironmentConfig(
  env: NodeJS.ProcessEnv = process.env,
): SeedEnvironmentConfig {
  return {
    database: loadDatabaseConfig(env),
    redis: loadRedisConfig(env),
  }
}

export function loadDatabaseConfig(env: NodeJS.ProcessEnv = process.env): CreateConnectionsOptions {
  if (env.DATABASE_URL) {
    const parsed = databaseUrlEnvSchema.parse(env)
    return { connectionString: parsed.DATABASE_URL, max: 5 }
  }

  const parsed = postgresEnvSchema.parse(env)
  return {
    host: parsed.PGHOST,
    port: parsed.PGPORT,
    database: parsed.PGDATABASE,
    user: parsed.PGUSER,
    password: parsed.PGPASSWORD,
    max: 5,
  }
}

export function loadRedisConfig(
  env: NodeJS.ProcessEnv = process.env,
): RedisClientOptions | undefined {
  const parsed = redisEnvSchema.parse(env)

  if (!parsed.REDIS_HOST) {
    return undefined
  }

  return {
    host: parsed.REDIS_HOST,
    port: parsed.REDIS_PORT,
    password: parsed.REDIS_PASSWORD,
    db: parsed.REDIS_DB,
  }
}
