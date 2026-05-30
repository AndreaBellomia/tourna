import { TokenService } from './token.service'
import { JwtService } from '@nestjs/jwt'

describe('TokenService', () => {
  const jwtMock = {
    sign: jest.fn(),
  } as unknown as JwtService

  let service: TokenService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new TokenService(jwtMock)
  })

  it('generates an access token by signing the payload', () => {
    const signMock = jwtMock.sign as jest.Mock
    signMock.mockReturnValue('signed-token')

    const payload = { userId: 'u-1', sessionId: 's-1' }
    const result = service.generateAccessToken(payload)

    expect(result).toBe('signed-token')
    expect(signMock).toHaveBeenCalledWith(payload)
  })

  it('generates a hex refresh token of 128 characters', () => {
    const token = service.generateRefreshToken()

    expect(typeof token).toBe('string')
    expect(token).toHaveLength(128)
    expect(token).toMatch(/^[0-9a-f]+$/)
  })

  it('produces consistent hashes for the same token', () => {
    const token = 'test-token'
    const hash1 = service.hashToken(token)
    const hash2 = service.hashToken(token)

    expect(hash1).toBe(hash2)
  })

  it('produces different hashes for different tokens', () => {
    const hash1 = service.hashToken('token-a')
    const hash2 = service.hashToken('token-b')

    expect(hash1).not.toBe(hash2)
  })

  it('returns a sha256 hex digest', () => {
    const hash = service.hashToken('test')

    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]+$/)
  })
})
