import { RedisModel } from '../core/redis.model'
import { BaseRedisEngine } from './base.engine'

export class RedisKVEngine extends BaseRedisEngine {
  async get<T, A extends unknown[]>(
    model: RedisModel<T, Buffer, A>,
    ...args: A
  ): Promise<T | null> {
    const key = this.buildKey(model, args)

    const raw = await this.rawGet(model, ...args)

    if (!raw) return null

    return this.decode(model, raw, key)
  }

  async set<T, A extends unknown[]>(model: RedisModel<T, Buffer, A>, value: T, ...args: A) {
    const key = this.buildKey(model, args)

    const validated = this.validate(model, value, key)

    const encoded = model.codec.encode(validated)

    await this.rawSet(model, encoded, ...args)
  }

  async delete<A extends unknown[]>(model: RedisModel<unknown, Buffer, A>, ...args: A) {
    return this.client.del(this.buildKey(model, args))
  }

  async rawGet<A extends unknown[]>(
    model: RedisModel<unknown, Buffer, A>,
    ...args: A
  ): Promise<Buffer | null> {
    return this.client.getBuffer(this.buildKey(model, args))
  }

  async rawSet<A extends unknown[]>(
    model: RedisModel<unknown, Buffer, A>,
    value: Buffer,
    ...args: A
  ) {
    const key = this.buildKey(model, args)

    if (model.ttl !== undefined) {
      await this.client.set(key, value, 'EX', model.ttl)
      return
    }

    await this.client.set(key, value)
  }
}
