import { RedisModel } from '../core/redis.model'
import { BaseRedisEngine } from './base.engine'

export class RedisHashEngine extends BaseRedisEngine {
  async hget<T, A extends unknown[]>(
    model: RedisModel<T, Buffer, A>,
    field: string,
    ...args: A
  ): Promise<T | null> {
    const key = this.buildKey(model, args)

    const raw = await this.client.hgetBuffer(key, field)

    if (!raw) return null

    return this.decode(model, raw, key)
  }

  async hset<T, A extends unknown[]>(
    model: RedisModel<T, Buffer, A>,
    field: string,
    value: T,
    ...args: A
  ) {
    const key = this.buildKey(model, args)

    const validated = this.validate(model, value, key)

    await this.client.hset(key, field, model.codec.encode(validated))

    if (model.ttl !== undefined) {
      await this.client.expire(key, model.ttl)
    }
  }

  async hdel<A extends unknown[]>(
    model: RedisModel<unknown, Buffer, A>,
    field: string,
    ...args: A
  ) {
    return this.client.hdel(this.buildKey(model, args), field)
  }
}
