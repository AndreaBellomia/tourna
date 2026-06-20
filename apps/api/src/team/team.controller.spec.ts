jest.mock('@repo/db', () => {
  class InvalidCursorError extends Error {}

  return {
    InvalidCursorError,
    paginateCursor: jest.fn(),
  }
})

jest.mock('./invitations/team-invitation.repository', () => ({
  TeamInvitationRepository: class TeamInvitationRepository {},
}))

import { Test, TestingModule } from '@nestjs/testing'
import { TeamController } from './team.controller'
import { TeamInvitationService } from './invitations/team-invitation.service'
import { TeamService } from './team.service'

describe('TeamController', () => {
  let controller: TeamController
  const teamServiceMock = {
    getTeams: jest.fn(),
  }
  const teamInvitationServiceMock = {
    createReusableTeamInvitation: jest.fn(),
    getInvitationsForTeam: jest.fn(),
    revokeTeamInvitation: jest.fn(),
    acceptTeamInvitation: jest.fn(),
  }

  beforeEach(async () => {
    teamServiceMock.getTeams.mockReset()
    teamInvitationServiceMock.createReusableTeamInvitation.mockReset()
    teamInvitationServiceMock.getInvitationsForTeam.mockReset()
    teamInvitationServiceMock.revokeTeamInvitation.mockReset()
    teamInvitationServiceMock.acceptTeamInvitation.mockReset()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamController],
      providers: [
        { provide: TeamService, useValue: teamServiceMock },
        { provide: TeamInvitationService, useValue: teamInvitationServiceMock },
      ],
    }).compile()

    controller = module.get<TeamController>(TeamController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('passes validated team list query to the service', async () => {
    const response = {
      data: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        nextCursor: null,
        previousCursor: null,
      },
    }

    teamServiceMock.getTeams.mockResolvedValue(response)

    await expect(
      controller.getTeams(undefined, {
        limit: 10,
        direction: 'next',
        search: 'atlas',
        visibility: 'public',
      }),
    ).resolves.toBe(response)
    expect(teamServiceMock.getTeams).toHaveBeenCalledWith(
      {
        limit: 10,
        direction: 'next',
        search: 'atlas',
        visibility: 'public',
      },
      undefined,
    )
  })

  it('creates a reusable team invitation through the invitation service', async () => {
    const response = {
      code: 'TNA-ABCD-2345',
      teamId: 'team-1',
      role: 'player',
      maxUses: 5,
      expiresAt: '2026-06-30T10:00:00.000Z',
    }

    teamInvitationServiceMock.createReusableTeamInvitation.mockResolvedValue(response)

    await expect(
      controller.createInvite({ userId: 'user-1' } as never, 'team-1', {
        role: 'player',
        maxUses: 5,
        expiresAt: '2026-06-30T10:00:00.000Z',
      }),
    ).resolves.toBe(response)
    expect(teamInvitationServiceMock.createReusableTeamInvitation).toHaveBeenCalledWith({
      createdById: 'user-1',
      teamId: 'team-1',
      role: 'player',
      maxUses: 5,
      expiresAt: new Date('2026-06-30T10:00:00.000Z'),
    })
  })

  it('accepts a team invitation through the invitation service', async () => {
    const response = { teamId: 'team-1' }

    teamInvitationServiceMock.acceptTeamInvitation.mockResolvedValue(response)

    await expect(
      controller.acceptInvite({ userId: 'user-1' } as never, 'TNA-ABCD-2345'),
    ).resolves.toBe(response)
    expect(teamInvitationServiceMock.acceptTeamInvitation).toHaveBeenCalledWith(
      'TNA-ABCD-2345',
      'user-1',
    )
  })

  it('returns paginated invitations for a team', async () => {
    const response = {
      data: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        nextCursor: null,
        previousCursor: null,
      },
    }

    teamInvitationServiceMock.getInvitationsForTeam.mockResolvedValue(response)

    await expect(
      controller.getInvitations('team-1', {
        limit: 20,
        direction: 'next',
      }),
    ).resolves.toBe(response)
    expect(teamInvitationServiceMock.getInvitationsForTeam).toHaveBeenCalledWith(
      {
        limit: 20,
        direction: 'next',
      },
      'team-1',
    )
  })

  it('revokes a team invitation through the invitation service', async () => {
    await expect(controller.revokeInvitation('team-1', 'invitation-1')).resolves.toBeUndefined()

    expect(teamInvitationServiceMock.revokeTeamInvitation).toHaveBeenCalledWith({
      invitationId: 'invitation-1',
      teamId: 'team-1',
    })
  })
})
