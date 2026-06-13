import msgpack from 'msgpack-lite'
import { RedisCodec } from '../core/redis.codec'

export class MsgpackCodec<T> implements RedisCodec<T, Buffer> {
  encode(value: T): Buffer {
    return msgpack.encode(value)
  }

  decode(value: Buffer): T {
    const decoded = msgpack.decode(value) as unknown
    return decoded as T
  }
}
