import { z } from 'zod'
import { RedisCodec } from './redis.codec'
import { KeyFactory } from './redis.keys'

export type RedisPrimitiveType = 'string' | 'hash' | 'list' | 'set' | 'zset' | 'stream'

export interface RedisBaseModel<A extends unknown[] = unknown[]> {
  namespace: string
  version: number
  key: KeyFactory<A>
  type: RedisPrimitiveType
  ttl?: number
}

export interface RedisModel<
  T,
  R = Buffer,
  A extends unknown[] = unknown[],
> extends RedisBaseModel<A> {
  schema: z.ZodType<T>
  codec: RedisCodec<T, R>
}

export interface RedisZSetModel<A extends unknown[] = unknown[]> extends RedisBaseModel<A> {
  type: 'zset'
}
