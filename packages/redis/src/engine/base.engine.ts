import { RedisClient } from '../client/redis.client'
import { RedisDecodingError, RedisValidationError } from '../core/redis.errors'
import { rawBuildKey } from '../core/redis.keys'
import { RedisBaseModel, RedisModel } from '../core/redis.model'

export abstract class BaseRedisEngine {
  constructor(protected readonly client: RedisClient) {}

  protected buildKey<A extends unknown[]>(model: RedisBaseModel<A>, args: A): string {
    return rawBuildKey(model.namespace, `v${model.version}`, ...model.key(...args))
  }

  protected validate<T, R, A extends unknown[]>(
    model: RedisModel<T, R, A>,
    value: T,
    key: string,
  ): T {
    try {
      return model.schema.parse(value)
    } catch (cause) {
      throw new RedisValidationError(`Validation failed for ${key}`, { cause })
    }
  }

  protected decode<T, R, A extends unknown[]>(
    model: RedisModel<T, R, A>,
    raw: Buffer,
    key: string,
  ): T {
    try {
      const decoded = model.codec.decode(raw as R)
      return model.schema.parse(decoded)
    } catch (cause) {
      throw new RedisDecodingError(`Cannot decode ${key}`, { cause })
    }
  }
}
