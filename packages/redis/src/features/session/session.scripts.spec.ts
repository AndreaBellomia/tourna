import { SessionScripts, type RotateRefreshResult } from './session.scripts'
import type { SessionData } from './session.model'

function createMockClient() {
  return {
    evalsha: jest.fn(),
    eval: jest.fn(),
  }
}

describe('SessionScripts', () => {
  let client: ReturnType<typeof createMockClient>
  let scripts: SessionScripts

  beforeEach(() => {
    jest.clearAllMocks()
    client = createMockClient()
    scripts = new SessionScripts(client as never)
  })

  describe('createSession', () => {
    it('executes the create-session script with correct keys and args', async () => {
      client.evalsha.mockResolvedValue(1)

      await scripts.createSession({
        sessionId: 's-1',
        userId: 'u-1',
        tokenHash: 'hash-1',
        userAgent: 'TestAgent',
        ip: '127.0.0.1',
        ttlSeconds: 604800,
      })

      expect(client.evalsha).toHaveBeenCalledTimes(1)

      const args = client.evalsha.mock.calls[0] as unknown[]
      // args: [sha, numKeys, ...keys, ...argv]
      const numKeys = args[1] as number
      expect(numKeys).toBe(3)

      // Keys
      expect(args[2]).toBe('auth:v1:session:s-1')
      expect(args[3]).toBe('auth:v1:refresh:hash-1')
      expect(args[4]).toBe('auth:v1:user_sessions:u-1')

      // Session JSON
      const sessionJson = JSON.parse(args[5] as string)
      expect(sessionJson.userId).toBe('u-1')
      expect(sessionJson.tokenHash).toBe('hash-1')
      expect(sessionJson.userAgent).toBe('TestAgent')
      expect(sessionJson.ip).toBe('127.0.0.1')
      expect(sessionJson.createdAt).toEqual(expect.any(Number))
      expect(sessionJson.expiresAt).toEqual(expect.any(Number))
    })

    it('falls back to EVAL on NOSCRIPT error', async () => {
      client.evalsha.mockRejectedValue(new Error('NOSCRIPT No matching script'))
      client.eval.mockResolvedValue(1)

      await scripts.createSession({
        sessionId: 's-1',
        userId: 'u-1',
        tokenHash: 'hash-1',
        ttlSeconds: 3600,
      })

      expect(client.eval).toHaveBeenCalledTimes(1)
    })
  })

  describe('rotateRefreshToken', () => {
    it('returns parsed OK result on success', async () => {
      const luaResult: RotateRefreshResult = {
        status: 'OK',
        userId: 'u-1',
        userAgent: 'Mozilla',
        ip: '10.0.0.1',
      }
      client.evalsha.mockResolvedValue(JSON.stringify(luaResult))

      const result = await scripts.rotateRefreshToken({
        oldTokenHash: 'old-hash',
        newSessionId: 's-2',
        newTokenHash: 'new-hash',
        ttlSeconds: 604800,
      })

      expect(result).toEqual(luaResult)

      const args = client.evalsha.mock.calls[0] as unknown[]
      const numKeys = args[1] as number
      expect(numKeys).toBe(1)
      expect(args[2]).toBe('auth:v1:refresh:old-hash')
      expect(args[3]).toBe('auth:v1') // key prefix
      expect(args[4]).toBe('s-2') // new session ID
      expect(args[5]).toBe('new-hash') // new token hash
    })

    it('returns TOKEN_NOT_FOUND when old token is gone', async () => {
      client.evalsha.mockResolvedValue(JSON.stringify({ status: 'TOKEN_NOT_FOUND' }))

      const result = await scripts.rotateRefreshToken({
        oldTokenHash: 'stale-hash',
        newSessionId: 's-2',
        newTokenHash: 'new-hash',
        ttlSeconds: 604800,
      })

      expect(result.status).toBe('TOKEN_NOT_FOUND')
    })
  })

  describe('revokeSession', () => {
    it('returns true when session was revoked', async () => {
      client.evalsha.mockResolvedValue(1)

      const result = await scripts.revokeSession('s-1')

      expect(result).toBe(true)

      const args = client.evalsha.mock.calls[0] as unknown[]
      expect(args[2]).toBe('auth:v1:session:s-1')
      expect(args[3]).toBe('auth:v1') // key prefix
      expect(args[4]).toBe('s-1') // session id
    })

    it('returns false when session was already gone (idempotent)', async () => {
      client.evalsha.mockResolvedValue(0)

      const result = await scripts.revokeSession('missing')

      expect(result).toBe(false)
    })
  })

  describe('getUserSessions', () => {
    it('executes the get-user-sessions script with correct keys and args', async () => {
      const sessions = [
        {
          sessionId: 's-1',
          data: {
            userId: 'u-1',
            tokenHash: 'h-1',
            createdAt: 1000,
            expiresAt: 2000,
          } satisfies SessionData,
        },
      ]
      client.evalsha.mockResolvedValue(JSON.stringify(sessions))

      await scripts.getUserSessions('u-1')

      expect(client.evalsha).toHaveBeenCalledTimes(1)

      const args = client.evalsha.mock.calls[0] as unknown[]
      const numKeys = args[1] as number
      expect(numKeys).toBe(1)
      expect(args[2]).toBe('auth:v1:user_sessions:u-1')
      expect(args[4]).toBe('auth:v1') // key prefix
    })

    it('returns an empty array when no sessions exist', async () => {
      client.evalsha.mockResolvedValue('[]')

      const result = await scripts.getUserSessions('no-one')

      expect(result).toEqual([])
    })

    it('parses multiple session entries', async () => {
      const sessions = [
        {
          sessionId: 's-1',
          data: {
            userId: 'u-1',
            tokenHash: 'h-1',
            userAgent: 'Chrome',
            createdAt: 1000,
            expiresAt: 2000,
          },
        },
        {
          sessionId: 's-2',
          data: {
            userId: 'u-1',
            tokenHash: 'h-2',
            createdAt: 1500,
            expiresAt: 2500,
          },
        },
      ]
      client.evalsha.mockResolvedValue(JSON.stringify(sessions))

      const result = await scripts.getUserSessions('u-1')

      expect(result).toHaveLength(2)
      expect(result[0]!.sessionId).toBe('s-1')
      expect(result[0]!.data.userAgent).toBe('Chrome')
      expect(result[1]!.sessionId).toBe('s-2')
      expect(result[1]!.data.userAgent).toBeUndefined()
    })

    it('falls back to EVAL on NOSCRIPT error', async () => {
      client.evalsha.mockRejectedValue(new Error('NOSCRIPT No matching script'))
      client.eval.mockResolvedValue('[]')

      const result = await scripts.getUserSessions('u-1')

      expect(client.eval).toHaveBeenCalledTimes(1)
      expect(result).toEqual([])
    })
  })
})
