import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { EmailVerificationTokenStore } from '@repo/redis'
import type { VerifyEmailResponse } from '@repo/contracts'
import { AppConfigService } from '~/config/config.service'
import { DatabaseService } from '~/database/database.service'
import { TaskProducerService } from '~/tasks/task-producer.service'
import { RedisService } from '~/redis/redis.service'
import { TokenService } from '~/tokens/token.service'

interface SendVerificationEmailInput {
  readonly userId: string
  readonly email: string
  readonly displayName: string
}

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name)
  private readonly store: EmailVerificationTokenStore

  constructor(
    private readonly db: DatabaseService,
    private readonly tokens: TokenService,
    private readonly config: AppConfigService,
    private readonly tasks: TaskProducerService,
    redis: RedisService,
  ) {
    this.store = new EmailVerificationTokenStore(redis.getClient())
  }

  async sendVerificationEmail(input: SendVerificationEmailInput): Promise<void> {
    const token = this.tokens.generateRefreshToken()
    const tokenHash = this.tokens.hashToken(token)

    await this.store.create({
      userId: input.userId,
      email: input.email,
      tokenHash,
      ttlSeconds: this.config.get('EMAIL_VERIFICATION_TTL_SECONDS'),
    })

    await this.tasks.triggerSendEmail(
      {
        to: input.email,
        metadata: {
          flow: 'email-verification',
          userId: input.userId,
        },
        idempotencyKey: `email-verification${input.userId}:${tokenHash}`,
        content: {
          template: 'post-registration-notification',
          data: {
            displayName: input.displayName,
            email: input.email,
            verificationUrl: this.buildVerificationUrl(token),
          },
        },
      },
      {
        idempotencyKey: `email-verification-${input.userId}-${tokenHash.slice(0, 16)}`,
      },
    )
  }

  async sendVerificationEmailForUser(userId: string): Promise<void> {
    const user = await this.db.db
      .selectFrom('users')
      .select(['id', 'email', 'display_name', 'email_verified'])
      .where('id', '=', userId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst()

    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (user.email_verified) {
      return
    }

    await this.sendVerificationEmail({
      userId: user.id,
      email: user.email,
      displayName: user.display_name,
    })
  }

  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    const tokenHash = this.tokens.hashToken(token)
    const data = await this.store.consume(tokenHash)

    if (!data) {
      throw new BadRequestException('Email verification token is invalid or expired')
    }

    const [user] = await this.db.db
      .updateTable('users')
      .set({ email_verified: true, updated_at: new Date() })
      .where('id', '=', data.userId)
      .where('email', '=', data.email)
      .where('deleted_at', 'is', null)
      .returning(['id'])
      .execute()

    if (!user) {
      throw new BadRequestException('Email verification token is no longer valid')
    }

    this.logger.log({
      message: 'User email verified',
      userId: data.userId,
      email: data.email,
    })

    return { verified: true }
  }

  private buildVerificationUrl(token: string): string {
    const url = new URL(this.config.get('EMAIL_VERIFICATION_URL_BASE'))
    url.searchParams.set('token', token)

    return url.toString()
  }
}
