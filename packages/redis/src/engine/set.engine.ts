import { RedisModel } from '../core/redis.model'
import { BaseRedisEngine } from './base.engine'

export class RedisSetEngine extends BaseRedisEngine {
  async add<T, A extends unknown[]>(model: RedisModel<T, Buffer, A>, value: T, ...args: A) {
    const key = this.buildKey(model, args)

    const validated = this.validate(model, value, key)

    await this.client.sadd(key, model.codec.encode(validated))
  }

  async members<T, A extends unknown[]>(model: RedisModel<T, Buffer, A>, ...args: A): Promise<T[]> {
    const key = this.buildKey(model, args)

    const raws = await this.client.smembersBuffer(key)

    return raws.map((r) => this.decode(model, r, key))
  }
}
