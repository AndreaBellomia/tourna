import { z } from 'zod'
import { RedisModel, RedisZSetModel } from '../../core/redis.model'
import { MsgpackCodec } from '../../codecs/msgpack.codec'

const sessionDataSchema = z.object({
  userId: z.string(),

  tokenHash: z.string(),
  userAgent: z.string().optional(),
  ip: z.string().optional(),
  createdAt: z.number(),

  expiresAt: z.number(),
})

export type SessionData = z.infer<typeof sessionDataSchema>

export const SessionModel: RedisModel<SessionData, Buffer, [sessionId: string]> = {
  namespace: 'auth',
  version: 1,
  key: (sessionId) => ['session', sessionId],
  schema: sessionDataSchema,
  type: 'string',
  codec: new MsgpackCodec<SessionData>(),
  ttl: 0,
}

export const UserSessionsIndexModel: RedisZSetModel<[userId: string]> = {
  namespace: 'auth',
  version: 1,
  key: (userId) => ['user_sessions', userId],
  type: 'zset',
}
