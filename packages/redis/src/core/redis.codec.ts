export interface RedisCodec<T, R = Buffer> {
  encode(value: T): R
  decode(value: R): T
}
