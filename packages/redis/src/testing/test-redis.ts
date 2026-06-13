import { randomUUID } from 'node:crypto'
import {
  createRedisClient,
  type RedisClient,
  type RedisClientOptions,
} from '../client/redis.client'

const DEFAULT_REDIS_HOST = 'localhost'
const DEFAULT_REDIS_PORT = 6379
const DEFAULT_REDIS_DB = 0
const DEFAULT_KEY_PREFIX_NAMESPACE = 'tourna:test'

export type TestRedisEnvironment = {
  client: RedisClient
  keyPrefix: string
  reset: () => Promise<void>
  destroy: () => Promise<void>
}

export type CreateRedisTestEnvironmentOptions = Partial<
  Pick<RedisClientOptions, 'host' | 'port' | 'password' | 'db'>
> & {
  keyPrefixNamespace?: string
  runId?: string
  workerId?: string
}

export async function createRedisTestEnvironment(
  options: CreateRedisTestEnvironmentOptions = {},
): Promise<TestRedisEnvironment> {
  const keyPrefix = buildRedisTestKeyPrefix(options)
  const client = createRedisClient({
    host: options.host ?? process.env.REDIS_HOST ?? DEFAULT_REDIS_HOST,
    port: options.port ?? Number(process.env.REDIS_PORT ?? DEFAULT_REDIS_PORT),
    password: options.password ?? process.env.REDIS_PASSWORD ?? '',
    db: options.db ?? Number(process.env.REDIS_TEST_DB ?? process.env.REDIS_DB ?? DEFAULT_REDIS_DB),
    keyPrefix,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  })
  const cleanupClient = createRedisClient({
    host: client.options.host ?? options.host ?? process.env.REDIS_HOST ?? DEFAULT_REDIS_HOST,
    port: Number(
      client.options.port ?? options.port ?? process.env.REDIS_PORT ?? DEFAULT_REDIS_PORT,
    ),
    password: options.password ?? process.env.REDIS_PASSWORD ?? '',
    db: Number(
      client.options.db ??
        options.db ??
        process.env.REDIS_TEST_DB ??
        process.env.REDIS_DB ??
        DEFAULT_REDIS_DB,
    ),
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  })

  try {
    await client.ping()
    await cleanupClient.ping()
  } catch (error) {
    await client.quit().catch(() => undefined)
    await cleanupClient.quit().catch(() => undefined)
    throw new Error(`Failed to connect to Redis test server: ${describeRedisTarget(client)}`, {
      cause: error,
    })
  }

  const environment: TestRedisEnvironment = {
    client,
    keyPrefix,
    reset: async () => {
      await deleteKeysWithPrefix(cleanupClient, keyPrefix)
    },
    destroy: async () => {
      await deleteKeysWithPrefix(cleanupClient, keyPrefix)
      await client.quit()
      await cleanupClient.quit()
    },
  }

  await environment.reset()

  return environment
}

export async function deleteKeysWithPrefix(client: RedisClient, keyPrefix: string) {
  let cursor = '0'

  do {
    const [nextCursor, keys] = await client.scan(cursor, 'MATCH', `${keyPrefix}*`, 'COUNT', 500)

    cursor = nextCursor

    if (keys.length > 0) {
      await client.unlink(...keys)
    }
  } while (cursor !== '0')
}

function buildRedisTestKeyPrefix(options: CreateRedisTestEnvironmentOptions) {
  const namespace = sanitizePrefixSegment(
    options.keyPrefixNamespace ?? DEFAULT_KEY_PREFIX_NAMESPACE,
  )
  const runId = sanitizePrefixSegment(
    options.runId ?? process.env.TOURNA_TEST_RUN_ID ?? randomUUID().slice(0, 8),
  )
  const workerId = sanitizePrefixSegment(options.workerId ?? process.env.JEST_WORKER_ID ?? '1')

  return `${namespace}:${runId}:${workerId}:`
}

function sanitizePrefixSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'test'
}

function describeRedisTarget(client: RedisClient) {
  const options = client.options

  return `${options.host}:${options.port}/${options.db}`
}
