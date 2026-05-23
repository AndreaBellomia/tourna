import { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PoliciesGuard } from './policies.guard'
import { AuthorizationService } from '../authorization.service'
import { Action, Subject } from '@repo/authorization'

function createHttpContext(request: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => class {},
  } as unknown as ExecutionContext
}

describe('PoliciesGuard', () => {
  const checkMock = jest.fn()

  const reflectorMock = {
    get: jest.fn(),
  } as unknown as Reflector

  const authzMock = {
    check: checkMock,
  } as unknown as AuthorizationService

  let guard: PoliciesGuard

  beforeEach(() => {
    jest.clearAllMocks()
    guard = new PoliciesGuard(reflectorMock, authzMock)
  })

  it('allows request when no policy metadata is set', async () => {
    reflectorMock.get = jest.fn().mockReturnValue(undefined)
    const ctx = createHttpContext({})

    await expect(guard.canActivate(ctx)).resolves.toBe(true)
  })

  it('blocks request when policy exists but user is missing', async () => {
    reflectorMock.get = jest.fn().mockReturnValue({
      action: Action.Read,
      subject: Subject.Match,
    })

    const ctx = createHttpContext({})
    await expect(guard.canActivate(ctx)).resolves.toBe(false)
  })

  it('delegates authorization using membership-based userId', async () => {
    reflectorMock.get = jest.fn().mockReturnValue({
      action: Action.Manage,
      subject: Subject.Tournament,
    })
    checkMock.mockResolvedValue(true)

    const ctx = createHttpContext({
      user: {
        userId: 'u-1',
        sessionId: 's-1',
      },
    })

    await expect(guard.canActivate(ctx)).resolves.toBe(true)
    expect(checkMock).toHaveBeenCalledWith('u-1', Action.Manage, Subject.Tournament)
  })
})
