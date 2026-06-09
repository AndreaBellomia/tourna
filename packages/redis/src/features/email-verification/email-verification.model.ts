import { z } from 'zod'
import { RedisModel } from '../../core/redis.model'
import { MsgpackCodec } from '../../codecs/msgpack.codec'

const emailVerificationTokenDataSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  tokenHash: z.string(),
  createdAt: z.number().int().positive(),
  expiresAt: z.number().int().positive(),
})

export type EmailVerificationTokenData = z.infer<typeof emailVerificationTokenDataSchema>

export const EmailVerificationTokenModel: RedisModel<
  EmailVerificationTokenData,
  Buffer,
  [tokenHash: string]
> = {
  namespace: 'auth',
  version: 1,
  key: (tokenHash) => ['email_verification', 'token', tokenHash],
  schema: emailVerificationTokenDataSchema,
  type: 'string',
  codec: new MsgpackCodec<EmailVerificationTokenData>(),
  ttl: 0,
}

export const UserEmailVerificationTokenModel: RedisModel<
  EmailVerificationTokenData,
  Buffer,
  [userId: string]
> = {
  namespace: 'auth',
  version: 1,
  key: (userId) => ['email_verification', 'user', userId],
  schema: emailVerificationTokenDataSchema,
  type: 'string',
  codec: new MsgpackCodec<EmailVerificationTokenData>(),
  ttl: 0,
}
