import { BadRequestException, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Action } from '@repo/authorization'
import { AuthorizationService } from '../authorization.service'
import { TEAM_MEMBERSHIP_POLICY_KEY, TEAM_POLICY_KEY } from '../decorators/team-policy.decorator'
import { TeamPoliciesGuard } from './team-policies.guard'

function createHttpContext(request: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => class {},
  } as unknown as ExecutionContext
}

describe('TeamPoliciesGuard', () => {
  const canAccessTeamActionMock = jest.fn()
  const hasActiveTeamMembershipMock = jest.fn()

  const reflectorMock = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector

  const authzMock = {
    canAccessTeamAction: canAccessTeamActionMock,
    hasActiveTeamMembership: hasActiveTeamMembershipMock,
  } as unknown as AuthorizationService

  let guard: TeamPoliciesGuard

  beforeEach(() => {
    jest.clearAllMocks()
    guard = new TeamPoliciesGuard(reflectorMock, authzMock)
  })

  it('allows requests without team metadata', async () => {
    reflectorMock.getAllAndOverride = jest.fn().mockReturnValue(undefined)

    await expect(guard.canActivate(createHttpContext({}))).resolves.toBe(true)
  })

  it('blocks protected team requests when user is missing', async () => {
    reflectorMock.getAllAndOverride = jest.fn((key) =>
      key === TEAM_POLICY_KEY ? { action: Action.Update, teamIdParam: 'id' } : undefined,
    )

    await expect(guard.canActivate(createHttpContext({ params: { id: 'team-1' } }))).resolves.toBe(
      false,
    )
  })

  it('delegates team action policies to authorization service', async () => {
    reflectorMock.getAllAndOverride = jest.fn((key) =>
      key === TEAM_POLICY_KEY ? { action: Action.Invite, teamIdParam: 'id' } : undefined,
    )
    canAccessTeamActionMock.mockResolvedValue(true)

    const request = {
      params: { id: 'team-1' },
      user: { userId: 'u-1', sessionId: 's-1' },
    }

    await expect(guard.canActivate(createHttpContext(request))).resolves.toBe(true)
    expect(canAccessTeamActionMock).toHaveBeenCalledWith('u-1', 'team-1', Action.Invite)
  })

  it('delegates team membership policies to authorization service', async () => {
    reflectorMock.getAllAndOverride = jest.fn((key) =>
      key === TEAM_MEMBERSHIP_POLICY_KEY ? { teamIdParam: 'id' } : undefined,
    )
    hasActiveTeamMembershipMock.mockResolvedValue(true)

    const request = {
      params: { id: 'team-1' },
      user: { userId: 'u-1', sessionId: 's-1' },
    }

    await expect(guard.canActivate(createHttpContext(request))).resolves.toBe(true)
    expect(hasActiveTeamMembershipMock).toHaveBeenCalledWith('u-1', 'team-1')
  })

  it('throws when team route param is missing', async () => {
    reflectorMock.getAllAndOverride = jest.fn((key) =>
      key === TEAM_POLICY_KEY ? { action: Action.Update, teamIdParam: 'id' } : undefined,
    )

    const request = {
      params: {},
      user: { userId: 'u-1', sessionId: 's-1' },
    }

    await expect(guard.canActivate(createHttpContext(request))).rejects.toThrow(BadRequestException)
  })
})
