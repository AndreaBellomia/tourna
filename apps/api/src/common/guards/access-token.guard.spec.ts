import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { AccessTokenGuard } from './access-token.guard'

function createHttpContext(request: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => class {},
  } as unknown as ExecutionContext
}

describe('AccessTokenGuard', () => {
  const verifyMock = jest.fn()

  const jwtMock = {
    verify: verifyMock,
  } as unknown as JwtService

  const reflectorMock = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector

  let guard: AccessTokenGuard

  beforeEach(() => {
    jest.clearAllMocks()
    guard = new AccessTokenGuard(jwtMock, reflectorMock)
  })

  it('allows public endpoints without token', () => {
    reflectorMock.getAllAndOverride = jest.fn().mockReturnValue(true)

    const canActivate = guard.canActivate(createHttpContext({ headers: {} }))

    expect(canActivate).toBe(true)
    expect(verifyMock).not.toHaveBeenCalled()
  })

  it('rejects request when authorization header is missing', () => {
    reflectorMock.getAllAndOverride = jest.fn().mockReturnValue(false)

    expect(() => guard.canActivate(createHttpContext({ headers: {} }))).toThrow(
      UnauthorizedException,
    )
  })

  it('parses and attaches jwt payload to request', () => {
    reflectorMock.getAllAndOverride = jest.fn().mockReturnValue(false)
    verifyMock.mockReturnValue({
      userId: 'u-1',
      sessionId: 's-1',
    })

    const request = {
      headers: {
        authorization: 'Bearer token-value',
      },
    }

    const canActivate = guard.canActivate(createHttpContext(request))

    expect(canActivate).toBe(true)
    expect(verifyMock).toHaveBeenCalledWith('token-value')
    expect(request).toEqual({
      headers: {
        authorization: 'Bearer token-value',
      },
      user: {
        userId: 'u-1',
        sessionId: 's-1',
      },
    })
  })
})
