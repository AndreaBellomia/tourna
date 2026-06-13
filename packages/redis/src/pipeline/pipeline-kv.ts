import type { ChainableCommander } from 'ioredis'
import type { RedisModel } from '../core/redis.model'
import { buildModelKey, decodeModelValue, validateModelValue } from '../engine/base.engine'
import { PendingResult } from './pending-result'
import type { RedisPipeline } from './redis.pipeline'

export class PipelineKVOps {
  constructor(private readonly pipeline: RedisPipeline) {}

  private get cmd(): ChainableCommander {
    return this.pipeline.commander
  }

  get<T, A extends unknown[]>(
    model: RedisModel<T, Buffer, A>,
    ...args: A
  ): PendingResult<T | null> {
    const key = buildModelKey(model, args)
    this.cmd.get(key)
    return this.pipeline.track<T | null>((raw) => {
      if (raw === null) return null
      const buf = typeof raw === 'string' ? Buffer.from(raw, 'utf8') : (raw as Buffer)
      return decodeModelValue(model, buf, key)
    })
  }

  set<T, A extends unknown[]>(
    model: RedisModel<T, Buffer, A>,
    value: T,
    ...args: A
  ): PendingResult<string> {
    const key = buildModelKey(model, args)
    const validated = validateModelValue(model, value, key)
    const encoded = model.codec.encode(validated)

    if (model.ttl !== undefined && model.ttl > 0) {
      this.cmd.set(key, encoded, 'EX', model.ttl)
    } else {
      this.cmd.set(key, encoded)
    }
    return this.pipeline.track<string>((raw) => raw as string)
  }

  delete<A extends unknown[]>(
    model: RedisModel<unknown, Buffer, A>,
    ...args: A
  ): PendingResult<number> {
    const key = buildModelKey(model, args)
    this.cmd.del(key)
    return this.pipeline.track<number>((raw) => raw as number)
  }
}
