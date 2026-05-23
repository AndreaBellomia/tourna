import { RedisCodec } from '../core/redis.codec'

export class JsonCodec<T> implements RedisCodec<T, Buffer> {
  encode(value: T): Buffer {
    return Buffer.from(JSON.stringify(value))
  }

  decode(value: Buffer): T {
    return JSON.parse(value.toString('utf8')) as T
  }
}
