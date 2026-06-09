import type { RedisClient } from '../../client/redis.client'
import { rawBuildKey } from '../../core/redis.keys'
import { decodeModelValue, validateModelValue } from '../../engine/base.engine'
import {
  EmailVerificationTokenModel,
  UserEmailVerificationTokenModel,
  type EmailVerificationTokenData,
} from './email-verification.model'

export interface CreateEmailVerificationTokenInput {
  readonly userId: string
  readonly email: string
  readonly tokenHash: string
  readonly ttlSeconds: number
}

export class EmailVerificationTokenStore {
  constructor(private readonly client: RedisClient) {}

  async create(input: CreateEmailVerificationTokenInput): Promise<EmailVerificationTokenData> {
    const now = Date.now()
    const data: EmailVerificationTokenData = {
      userId: input.userId,
      email: input.email,
      tokenHash: input.tokenHash,
      createdAt: now,
      expiresAt: now + input.ttlSeconds * 1000,
    }
    const validated = validateModelValue(EmailVerificationTokenModel, data, this.tokenKey(input.tokenHash))
    const encoded = EmailVerificationTokenModel.codec.encode(validated)
    const userKey = this.userKey(input.userId)
    const previous = await this.getByUserId(input.userId)
    const pipeline = this.client.multi()

    if (previous) {
      pipeline.del(this.tokenKey(previous.tokenHash))
    }

    pipeline.set(this.tokenKey(input.tokenHash), encoded, 'EX', input.ttlSeconds)
    pipeline.set(userKey, encoded, 'EX', input.ttlSeconds)

    await pipeline.exec()

    return validated
  }

  async getByTokenHash(tokenHash: string): Promise<EmailVerificationTokenData | null> {
    return this.get(EmailVerificationTokenModel, this.tokenKey(tokenHash))
  }

  async getByUserId(userId: string): Promise<EmailVerificationTokenData | null> {
    return this.get(UserEmailVerificationTokenModel, this.userKey(userId))
  }

  async consume(tokenHash: string): Promise<EmailVerificationTokenData | null> {
    const data = await this.getByTokenHash(tokenHash)

    if (!data) {
      return null
    }

    await this.client.del(this.tokenKey(tokenHash), this.userKey(data.userId))

    return data
  }

  async deleteForUser(userId: string): Promise<void> {
    const data = await this.getByUserId(userId)

    if (!data) {
      return
    }

    await this.client.del(this.tokenKey(data.tokenHash), this.userKey(userId))
  }

  private async get(
    model: typeof EmailVerificationTokenModel | typeof UserEmailVerificationTokenModel,
    key: string,
  ): Promise<EmailVerificationTokenData | null> {
    const raw = await this.client.getBuffer(key)

    if (!raw) {
      return null
    }

    return decodeModelValue(model, raw, key)
  }

  private tokenKey(tokenHash: string): string {
    return rawBuildKey(
      EmailVerificationTokenModel.namespace,
      `v${EmailVerificationTokenModel.version}`,
      ...EmailVerificationTokenModel.key(tokenHash),
    )
  }

  private userKey(userId: string): string {
    return rawBuildKey(
      UserEmailVerificationTokenModel.namespace,
      `v${UserEmailVerificationTokenModel.version}`,
      ...UserEmailVerificationTokenModel.key(userId),
    )
  }
}
