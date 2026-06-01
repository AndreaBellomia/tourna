import { Action, Subject } from '@repo/authorization'
import { AuthorizationService } from './authorization.service'

describe('AuthorizationService', () => {
  const cacheServiceMock = {
    getOrSet: jest.fn(),
  }

  const queryMock = {
    selectAll: jest.fn(),
    where: jest.fn(),
    execute: jest.fn(),
  }

  const databaseServiceMock = {
    db: {
      selectFrom: jest.fn(),
    },
  }

  const configServiceMock = {
    get: jest.fn(),
  }

  let service: AuthorizationService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new AuthorizationService(
      cacheServiceMock as never,
      databaseServiceMock as never,
      configServiceMock as never,
    )
  })

  it('loads memberships through cache with configured ttl', async () => {
    configServiceMock.get.mockReturnValue(300)

    databaseServiceMock.db.selectFrom.mockReturnValue(queryMock)
    queryMock.selectAll.mockReturnValue(queryMock)
    queryMock.where.mockReturnValue(queryMock)
    queryMock.execute.mockResolvedValue([{ id: 'm-1', user_id: 'u-1', role_code: 'global_admin' }])

    cacheServiceMock.getOrSet.mockImplementation(
      async (_key: readonly string[], factory: () => Promise<unknown>) => factory(),
    )

    const memberships = await service.getByUser('u-1')

    expect(memberships).toHaveLength(1)
    expect(configServiceMock.get).toHaveBeenCalledWith('CACHE_DURATION_AUTHORIZATION')
    expect(cacheServiceMock.getOrSet).toHaveBeenCalledTimes(1)
    expect(databaseServiceMock.db.selectFrom).toHaveBeenCalledWith('memberships')
  })

  it('builds ability from memberships loaded by user id', async () => {
    const getByUserSpy = jest.spyOn(service, 'getByUser').mockResolvedValue([
      {
        id: 'm-1',
        user_id: 'u-1',
        role_code: 'global_admin',
        scope_type: 'global',
        scope_id: null,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ] as never)

    const ability = await service.build('u-1')

    expect(getByUserSpy).toHaveBeenCalledWith('u-1')
    expect(ability.can(Action.Manage, Subject.Match)).toBe(true)
  })

  it('checks ability through CASL build output', async () => {
    const can = jest.fn().mockReturnValue(true)
    jest.spyOn(service, 'build').mockResolvedValue({ can } as never)

    const allowed = await service.check('u-1', Action.Read, Subject.Match)

    expect(allowed).toBe(true)
    expect(can).toHaveBeenCalledWith(Action.Read, Subject.Match)
  })

  it('allows team action through application membership ability', async () => {
    const can = jest.fn().mockReturnValue(true)
    jest
      .spyOn(service, 'getTeamAuthorizationTarget')
      .mockResolvedValue({ id: 'team-1', organization_id: 'org-1' } as never)
    jest.spyOn(service, 'build').mockResolvedValue({ can } as never)
    const teamMembershipSpy = jest.spyOn(service, 'getActiveTeamMembership')

    const allowed = await service.canAccessTeamAction('u-1', 'team-1', Action.Update)

    expect(allowed).toBe(true)
    expect(can).toHaveBeenCalledWith(
      Action.Update,
      expect.objectContaining({
        id: 'team-1',
        organizationId: 'org-1',
      }),
    )
    expect(teamMembershipSpy).not.toHaveBeenCalled()
  })

  it('allows team action through internal team management membership', async () => {
    jest
      .spyOn(service, 'getTeamAuthorizationTarget')
      .mockResolvedValue({ id: 'team-1', organization_id: null } as never)
    jest
      .spyOn(service, 'build')
      .mockResolvedValue({ can: jest.fn().mockReturnValue(false) } as never)
    jest.spyOn(service, 'getActiveTeamMembership').mockResolvedValue({
      id: 'tm-1',
      team_id: 'team-1',
      user_id: 'u-1',
      role: 'manager',
      status: 'active',
    } as never)

    const allowed = await service.canAccessTeamAction('u-1', 'team-1', Action.Update)

    expect(allowed).toBe(true)
  })

  it('rejects team action when internal membership is not a management role', async () => {
    jest
      .spyOn(service, 'getTeamAuthorizationTarget')
      .mockResolvedValue({ id: 'team-1', organization_id: null } as never)
    jest
      .spyOn(service, 'build')
      .mockResolvedValue({ can: jest.fn().mockReturnValue(false) } as never)
    jest.spyOn(service, 'getActiveTeamMembership').mockResolvedValue({
      id: 'tm-1',
      team_id: 'team-1',
      user_id: 'u-1',
      role: 'player',
      status: 'active',
    } as never)

    const allowed = await service.canAccessTeamAction('u-1', 'team-1', Action.Update)

    expect(allowed).toBe(false)
  })

  it('reports active team membership presence', async () => {
    jest.spyOn(service, 'getActiveTeamMembership').mockResolvedValue({
      id: 'tm-1',
      team_id: 'team-1',
      user_id: 'u-1',
      role: 'player',
      status: 'active',
    } as never)

    await expect(service.hasActiveTeamMembership('u-1', 'team-1')).resolves.toBe(true)
  })
})
