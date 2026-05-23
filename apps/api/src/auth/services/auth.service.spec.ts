import { UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  const db = {
    db: {
      selectFrom: jest.fn(),
      insertInto: jest.fn(),
    },
  }

  const tokens = {
    generateRefreshToken: jest.fn(),
    hashToken: jest.fn(),
    generateAccessToken: jest.fn(),
  }

  const sessions = {
    createSession: jest.fn(),
    findSessionByRefreshToken: jest.fn(),
    rotateRefreshToken: jest.fn(),
    revokeSession: jest.fn(),
  }

  const config = {
    get: jest.fn(),
  }

  let service: AuthService

  beforeEach(() => {
    jest.clearAllMocks()
    config.get.mockReturnValue(64)
    service = new AuthService(db as never, tokens as never, sessions as never, config as never)
  })

  it('rejects signup when email is already in use', async () => {
    db.db.selectFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      executeTakeFirst: jest.fn().mockResolvedValue({ id: 'user-1' }),
    })

    await expect(
      service.signup({ email: 'test@example.com', password: 'password123' }, 'ua', '127.0.0.1'),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('creates a session on successful login', async () => {
    const password = 'password123'
    const storedHash = await service.hashPassword(password)

    db.db.selectFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      executeTakeFirst: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password_hash: storedHash,
      }),
    })

    tokens.generateRefreshToken.mockReturnValue('refresh-token')
    tokens.hashToken.mockReturnValue('hashed-refresh-token')
    tokens.generateAccessToken.mockReturnValue('access-token')

    const result = await service.login({ email: 'test@example.com', password }, 'ua', '127.0.0.1')

    expect(result.accessToken).toBe('access-token')
    expect(result.refreshToken).toBe('refresh-token')
    expect(result.sessionId).toEqual(expect.any(String))
    expect(sessions.createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        tokenHash: 'hashed-refresh-token',
        userAgent: 'ua',
        ip: '127.0.0.1',
      }),
    )
  })

  it('rejects refresh when the refresh token is unknown', async () => {
    tokens.hashToken.mockReturnValue('hashed-refresh-token')
    sessions.findSessionByRefreshToken.mockResolvedValue(null)

    await expect(service.refresh('refresh-token')).rejects.toBeInstanceOf(UnauthorizedException)
  })
})
