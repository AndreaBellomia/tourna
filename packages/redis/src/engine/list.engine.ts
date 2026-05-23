import { RedisModel } from '../core/redis.model'
import { BaseRedisEngine } from './base.engine'

export class RedisListEngine extends BaseRedisEngine {
  async lpush<T, A extends unknown[]>(model: RedisModel<T, Buffer, A>, value: T, ...args: A) {
    const key = this.buildKey(model, args)

    const validated = this.validate(model, value, key)

    await this.client.lpush(key, model.codec.encode(validated))
  }

  async rpop<T, A extends unknown[]>(
    model: RedisModel<T, Buffer, A>,
    ...args: A
  ): Promise<T | null> {
    const key = this.buildKey(model, args)

    const raw = await this.client.rpopBuffer(key)

    if (!raw) return null

    return this.decode(model, raw, key)
  }
}
