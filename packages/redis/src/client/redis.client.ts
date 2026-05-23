import Redis from 'ioredis'

export interface RedisClientOptions {
  host: string
  port: number
  password: string
  db: number
  keyPrefix?: string
  lazyConnect?: boolean
  maxRetriesPerRequest?: number
}

export function createRedisClient(options: RedisClientOptions): RedisClient {
  const client = new Redis({
    host: options.host,
    port: options.port,
    password: options.password,
    db: options.db,
    keyPrefix: options.keyPrefix,

    lazyConnect: options.lazyConnect ?? true,
    maxRetriesPerRequest: options.maxRetriesPerRequest ?? 3,
  })

  client.on('error', (err) => {
    console.error('[Redis]', err)
  })

  return client
}

export type RedisClient = InstanceType<typeof Redis>
