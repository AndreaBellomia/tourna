import { z } from 'zod'
import { RedisModel } from '../../core/redis.model'
import { JsonCodec } from '../../codecs/json.codec'

const refreshTokenDataSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
})

export type RefreshTokenData = z.infer<typeof refreshTokenDataSchema>

export const RefreshTokenModel: RedisModel<RefreshTokenData, Buffer, [tokenHash: string]> = {
  namespace: 'auth',
  version: 1,
  key: (tokenHash) => ['refresh', tokenHash],
  schema: refreshTokenDataSchema,
  type: 'string',
  codec: new JsonCodec<RefreshTokenData>(),
  ttl: 0,
}
