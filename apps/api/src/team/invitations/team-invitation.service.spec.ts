jest.mock('~/user/user.repository', () => ({
  UserRepository: class UserRepository {},
}))

import { TeamInvitationService } from './team-invitation.service'

describe('TeamInvitationService', () => {
  const teamInvitationRepositoryMock = {
    createTeamInvitation: jest.fn(),
    revokeTeamInvitation: jest.fn(),
  }
  const userRepositoryMock = {
    getUserById: jest.fn(),
  }
  let service: TeamInvitationService

  beforeEach(() => {
    teamInvitationRepositoryMock.createTeamInvitation.mockReset()
    teamInvitationRepositoryMock.revokeTeamInvitation.mockReset()
    userRepositoryMock.getUserById.mockReset()
    service = new TeamInvitationService(
      teamInvitationRepositoryMock as never,
      userRepositoryMock as never,
    )
  })

  it('normalizes and hashes invitation codes consistently', () => {
    expect(service.normalizeInvitationCode(' tna-abcd-2345 ')).toBe('TNAABCD2345')
    expect(service.hashInvitationCode('TNA-ABCD-2345')).toBe(
      service.hashInvitationCode(' tnaabcd2345 '),
    )
  })

  it('creates reusable invitations with a hashed code', async () => {
    teamInvitationRepositoryMock.createTeamInvitation.mockResolvedValue({ id: 'invitation-1' })

    const code = await service.createReusableTeamInvitation({
      createdById: 'user-1',
      teamId: 'team-1',
      role: 'player',
      maxUses: 5,
      expiresAt: new Date('2026-06-30T10:00:00.000Z'),
    })

    expect(code).toMatch(/^TNA-[A-Z2-9]{4}-[A-Z2-9]{4}$/)
    expect(teamInvitationRepositoryMock.createTeamInvitation).toHaveBeenCalledWith({
      createdById: 'user-1',
      codeHash: service.hashInvitationCode(code),
      teamId: 'team-1',
      role: 'player',
      maxUses: 5,
      expiresAt: new Date('2026-06-30T10:00:00.000Z'),
    })
  })
})
