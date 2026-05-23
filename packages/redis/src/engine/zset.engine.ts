import { RedisZSetModel } from '../core/redis.model'
import { BaseRedisEngine } from './base.engine'

export type ZSetScore = number | '-inf' | '+inf'

export class RedisZSetEngine extends BaseRedisEngine {
  async zadd<A extends unknown[]>(
    model: RedisZSetModel<A>,
    score: number,
    member: string,
    ...args: A
  ): Promise<number> {
    const key = this.buildKey(model, args)
    return this.client.zadd(key, score, member)
  }

  async zrem<A extends unknown[]>(
    model: RedisZSetModel<A>,
    member: string,
    ...args: A
  ): Promise<number> {
    const key = this.buildKey(model, args)
    return this.client.zrem(key, member)
  }

  async zrange<A extends unknown[]>(
    model: RedisZSetModel<A>,
    start: number,
    stop: number,
    ...args: A
  ): Promise<string[]> {
    const key = this.buildKey(model, args)
    return this.client.zrange(key, start, stop)
  }

  async zrangebyscore<A extends unknown[]>(
    model: RedisZSetModel<A>,
    min: ZSetScore,
    max: ZSetScore,
    ...args: A
  ): Promise<string[]> {
    const key = this.buildKey(model, args)
    return this.client.zrangebyscore(key, min, max)
  }

  async zremrangebyscore<A extends unknown[]>(
    model: RedisZSetModel<A>,
    min: ZSetScore,
    max: ZSetScore,
    ...args: A
  ): Promise<number> {
    const key = this.buildKey(model, args)
    return this.client.zremrangebyscore(key, min, max)
  }

  async zscore<A extends unknown[]>(
    model: RedisZSetModel<A>,
    member: string,
    ...args: A
  ): Promise<number | null> {
    const key = this.buildKey(model, args)
    const raw = await this.client.zscore(key, member)
    return raw !== null ? Number(raw) : null
  }
}
