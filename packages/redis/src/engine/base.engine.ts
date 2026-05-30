import { RedisClient } from '../client/redis.client'
import { RedisDecodingError, RedisValidationError } from '../core/redis.errors'
import { rawBuildKey } from '../core/redis.keys'
import { RedisBaseModel, RedisModel } from '../core/redis.model'

export function buildModelKey<A extends unknown[]>(model: RedisBaseModel<A>, args: A): string {
  return rawBuildKey(model.namespace, `v${model.version}`, ...model.key(...args))
}

export function validateModelValue<T, R, A extends unknown[]>(
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

export function decodeModelValue<T, R, A extends unknown[]>(
  model: RedisModel<T, R, A>,
  raw: R,
  key: string,
): T {
  try {
    const decoded = model.codec.decode(raw)
    return model.schema.parse(decoded)
  } catch (cause) {
    throw new RedisDecodingError(`Cannot decode ${key}`, { cause })
  }
}

export abstract class BaseRedisEngine {
  constructor(protected readonly client: RedisClient) {}

  protected buildKey<A extends unknown[]>(model: RedisBaseModel<A>, args: A): string {
    return buildModelKey(model, args)
  }

  protected validate<T, R, A extends unknown[]>(
    model: RedisModel<T, R, A>,
    value: T,
    key: string,
  ): T {
    return validateModelValue(model, value, key)
  }

  protected decode<T, R, A extends unknown[]>(
    model: RedisModel<T, R, A>,
    raw: Buffer,
    key: string,
  ): T {
    return decodeModelValue(model, raw as R, key)
  }
}
