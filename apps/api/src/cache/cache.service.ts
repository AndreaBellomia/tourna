import { Injectable } from '@nestjs/common'
import { RedisService } from '~/redis/redis.service'
import { MsgpackCodec, rawBuildKey } from '@repo/redis'

@Injectable()
export class CacheService {
  private readonly codec: MsgpackCodec<unknown>

  constructor(private readonly redis: RedisService) {
    this.codec = new MsgpackCodec()
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.getClient().getBuffer(key)

    if (!value) return null

    return this.codec.decode(value) as T
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const serialized = this.codec.encode(value)

    if (ttl) {
      await this.redis.getClient().set(key, serialized, 'EX', ttl)
      return
    }

    await this.redis.getClient().set(key, serialized)
  }

  async del(key: string): Promise<void> {
    await this.redis.getClient().del(key)
  }

  async deleteByPrefix(prefix: string | readonly string[]): Promise<number> {
    const normalizedPrefix = typeof prefix === 'string' ? prefix : rawBuildKey(...prefix)
    const pattern = `${normalizedPrefix}:*`
    let cursor = '0'
    let deleted = 0
    const client = this.redis.getClient()

    do {
      const [nextCursor, keys] = (await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100)) as [
        string,
        string[],
      ]
      cursor = nextCursor

      if (keys.length > 0) {
        deleted += await client.del(...keys)
      }
    } while (cursor !== '0')

    return deleted
  }

  async getOrSet<T>(key: string[], factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(rawBuildKey(...key))

    if (cached !== null) return cached

    const fresh = await factory()

    await this.set(rawBuildKey(...key), fresh, ttl)

    return fresh
  }
}
