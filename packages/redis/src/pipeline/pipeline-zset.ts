import type { ChainableCommander } from 'ioredis'
import type { RedisZSetModel } from '../core/redis.model'
import { buildModelKey } from '../engine/base.engine'
import type { ZSetScore } from '../engine/zset.engine'
import { PendingResult } from './pending-result'
import type { RedisPipeline } from './redis.pipeline'

export class PipelineZSetOps {
  constructor(private readonly pipeline: RedisPipeline) {}

  private get cmd(): ChainableCommander {
    return this.pipeline.commander
  }

  zadd<A extends unknown[]>(
    model: RedisZSetModel<A>,
    score: number,
    member: string,
    ...args: A
  ): PendingResult<number> {
    const key = buildModelKey(model, args)
    this.cmd.zadd(key, score, member)
    return this.pipeline.track<number>((raw) => raw as number)
  }

  zrem<A extends unknown[]>(
    model: RedisZSetModel<A>,
    member: string,
    ...args: A
  ): PendingResult<number> {
    const key = buildModelKey(model, args)
    this.cmd.zrem(key, member)
    return this.pipeline.track<number>((raw) => raw as number)
  }

  zrange<A extends unknown[]>(
    model: RedisZSetModel<A>,
    start: number,
    stop: number,
    ...args: A
  ): PendingResult<string[]> {
    const key = buildModelKey(model, args)
    this.cmd.zrange(key, start, stop)
    return this.pipeline.track<string[]>((raw) => raw as string[])
  }

  zrangebyscore<A extends unknown[]>(
    model: RedisZSetModel<A>,
    min: ZSetScore,
    max: ZSetScore,
    ...args: A
  ): PendingResult<string[]> {
    const key = buildModelKey(model, args)
    this.cmd.zrangebyscore(key, min, max)
    return this.pipeline.track<string[]>((raw) => raw as string[])
  }

  zremrangebyscore<A extends unknown[]>(
    model: RedisZSetModel<A>,
    min: ZSetScore,
    max: ZSetScore,
    ...args: A
  ): PendingResult<number> {
    const key = buildModelKey(model, args)
    this.cmd.zremrangebyscore(key, min, max)
    return this.pipeline.track<number>((raw) => raw as number)
  }

  zscore<A extends unknown[]>(
    model: RedisZSetModel<A>,
    member: string,
    ...args: A
  ): PendingResult<string | null> {
    const key = buildModelKey(model, args)
    this.cmd.zscore(key, member)
    return this.pipeline.track<string | null>((raw) => raw as string | null)
  }
}
