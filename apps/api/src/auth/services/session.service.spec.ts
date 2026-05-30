import { SessionService, CreateSessionParams, RotateRefreshParams } from './session.service'

describe('SessionService', () => {
  const scriptsMock = {
    createSession: jest.fn(),
    rotateRefreshToken: jest.fn(),
    revokeSession: jest.fn(),
  }

  const kvMock = {
    get: jest.fn(),
  }

  const zsetMock = {
    zrange: jest.fn(),
    zrem: jest.fn(),
    zremrangebyscore: jest.fn(),
  }

  const redisMock = {
    engine: {
      kv: kvMock,
      zset: zsetMock,
    },
    getClient: jest.fn(),
  }

  const configMock = {
    get: jest.fn(),
  }

  let service: SessionService

  beforeEach(() => {
    jest.clearAllMocks()
    configMock.get.mockReturnValue(604800) // 7 days in seconds
    service = new SessionService(redisMock as never, configMock as never)
    // Replace the internal scripts instance with our mock
    ;(service as unknown as { scripts: typeof scriptsMock }).scripts = scriptsMock
  })

  const sessionParams: CreateSessionParams = {
    sessionId: 's-1',
    userId: 'u-1',
    tokenHash: 'hash-1',
    userAgent: 'TestAgent',
    ip: '127.0.0.1',
  }

  describe('createSession', () => {
    it('delegates to SessionScripts with TTL from config', async () => {
      await service.createSession(sessionParams)

      expect(scriptsMock.createSession).toHaveBeenCalledWith({
        ...sessionParams,
        ttlSeconds: 604800,
      })
    })
  })

  describe('rotateRefreshToken', () => {
    it('delegates to SessionScripts with TTL from config', async () => {
      scriptsMock.rotateRefreshToken.mockResolvedValue({
        status: 'OK',
        userId: 'u-1',
        userAgent: 'Mozilla',
        ip: '10.0.0.1',
      })

      const params: RotateRefreshParams = {
        oldTokenHash: 'old-hash',
        newSessionId: 's-2',
        newTokenHash: 'new-hash',
      }

      const result = await service.rotateRefreshToken(params)

      expect(scriptsMock.rotateRefreshToken).toHaveBeenCalledWith({
        ...params,
        ttlSeconds: 604800,
      })
      expect(result.status).toBe('OK')
    })

    it('returns TOKEN_NOT_FOUND when token is stale', async () => {
      scriptsMock.rotateRefreshToken.mockResolvedValue({
        status: 'TOKEN_NOT_FOUND',
      })

      const result = await service.rotateRefreshToken({
        oldTokenHash: 'stale',
        newSessionId: 's-2',
        newTokenHash: 'new',
      })

      expect(result.status).toBe('TOKEN_NOT_FOUND')
    })
  })

  describe('revokeSession', () => {
    it('delegates to SessionScripts', async () => {
      scriptsMock.revokeSession.mockResolvedValue(true)

      await service.revokeSession('s-1')

      expect(scriptsMock.revokeSession).toHaveBeenCalledWith('s-1')
    })
  })

  describe('getSession', () => {
    it('returns session data when found', async () => {
      const sessionData = { userId: 'u-1', tokenHash: 'h' }
      kvMock.get.mockResolvedValue(sessionData)

      const result = await service.getSession('s-1')

      expect(result).toEqual(sessionData)
    })

    it('returns null when session is not found', async () => {
      kvMock.get.mockResolvedValue(null)

      const result = await service.getSession('missing')

      expect(result).toBeNull()
    })
  })

  describe('getUserSessions', () => {
    it('returns active sessions for a user', async () => {
      zsetMock.zrange.mockResolvedValue(['s-1', 's-2'])
      const session1 = { userId: 'u-1', tokenHash: 'h-1' }
      const session2 = { userId: 'u-1', tokenHash: 'h-2' }
      kvMock.get.mockResolvedValueOnce(session1).mockResolvedValueOnce(session2)

      const result = await service.getUserSessions('u-1')

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ sessionId: 's-1', data: session1 })
    })

    it('removes ghost entries where session data no longer exists', async () => {
      zsetMock.zrange.mockResolvedValue(['s-1', 's-ghost'])
      const session1 = { userId: 'u-1', tokenHash: 'h-1' }
      kvMock.get.mockResolvedValueOnce(session1).mockResolvedValueOnce(null)

      const result = await service.getUserSessions('u-1')

      expect(result).toHaveLength(1)
      expect(zsetMock.zrem).toHaveBeenCalledTimes(1)
    })
  })
})
