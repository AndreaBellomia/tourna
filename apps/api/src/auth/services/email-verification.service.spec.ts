import { BadRequestException } from '@nestjs/common'
import { EmailVerificationTokenModel } from '@repo/redis'
import { EmailVerificationService } from './email-verification.service'

function createUpdateUserQuery(result: unknown[]) {
  return {
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue(result),
  }
}

describe('EmailVerificationService', () => {
  const db = {
    db: {
      selectFrom: jest.fn(),
      updateTable: jest.fn(),
    },
  }
  const tokens = {
    generateRefreshToken: jest.fn(),
    hashToken: jest.fn(),
  }
  const config = {
    get: jest.fn(),
  }
  const queue = {
    enqueueSendEmail: jest.fn(),
  }
  const redisClient = {
    getBuffer: jest.fn(),
    multi: jest.fn(),
    del: jest.fn(),
  }
  const redis = {
    getClient: jest.fn(() => redisClient),
  }
  const pipeline = {
    del: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  }

  let service: EmailVerificationService

  beforeEach(() => {
    jest.clearAllMocks()
    config.get.mockImplementation((key: string) => {
      if (key === 'EMAIL_VERIFICATION_TTL_SECONDS') return 604800
      if (key === 'EMAIL_VERIFICATION_URL_BASE') return 'https://tourna.test/verify-email'
      return undefined
    })
    tokens.generateRefreshToken.mockReturnValue('raw-token')
    tokens.hashToken.mockReturnValue('hashed-token')
    redisClient.getBuffer.mockResolvedValue(null)
    redisClient.multi.mockReturnValue(pipeline)
    redisClient.del.mockResolvedValue(1)
    queue.enqueueSendEmail.mockResolvedValue({ id: 'job-1' })

    service = new EmailVerificationService(
      db as never,
      tokens as never,
      config as never,
      queue as never,
      redis as never,
    )
  })

  it('stores a hashed token and enqueues a verification email', async () => {
    await service.sendVerificationEmail({
      userId: 'user-1',
      email: 'andrea@example.com',
      displayName: 'Andrea',
    })

    expect(redisClient.getBuffer).toHaveBeenCalledWith('auth:v1:email_verification:user:user-1')
    expect(pipeline.set).toHaveBeenCalledWith(
      'auth:v1:email_verification:token:hashed-token',
      expect.any(Buffer),
      'EX',
      604800,
    )
    expect(queue.enqueueSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'andrea@example.com',
        content: {
          template: 'post-registration-notification',
          data: {
            displayName: 'Andrea',
            email: 'andrea@example.com',
            verificationUrl: 'https://tourna.test/verify-email?token=raw-token',
          },
        },
      }),
      {
        jobId: 'email-verification-user-1-hashed-token',
      },
    )
  })

  it('consumes a token and marks the user email as verified', async () => {
    const data = {
      userId: 'user-1',
      email: 'andrea@example.com',
      tokenHash: 'hashed-token',
      createdAt: Date.now(),
      expiresAt: Date.now() + 604800000,
    }
    redisClient.getBuffer.mockResolvedValue(EmailVerificationTokenModel.codec.encode(data))
    db.db.updateTable.mockReturnValue(createUpdateUserQuery([{ id: 'user-1' }]))

    await expect(service.verifyEmail('raw-token')).resolves.toEqual({ verified: true })

    expect(db.db.updateTable).toHaveBeenCalledWith('users')
    expect(redisClient.del).toHaveBeenCalledWith(
      'auth:v1:email_verification:token:hashed-token',
      'auth:v1:email_verification:user:user-1',
    )
  })

  it('rejects missing or expired tokens', async () => {
    redisClient.getBuffer.mockResolvedValue(null)

    await expect(service.verifyEmail('raw-token')).rejects.toBeInstanceOf(BadRequestException)
  })
})
