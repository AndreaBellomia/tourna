import { NotFoundException } from '@nestjs/common'
import { TeamInvitationService } from './team-invitation.service'

jest.mock('./team-invitation.repository', () => ({
  TeamInvitationRepository: class TeamInvitationRepository {},
}))

describe('TeamInvitationService', () => {
  let service: TeamInvitationService

  const teamInvitationRepositoryMock = {
    checkIfCodeHashExists: jest.fn(),
    createTeamInvitation: jest.fn(),
    revokeTeamInvitation: jest.fn(),
    findValidInvitationByCodeHash: jest.fn(),
    acceptTeamInvitation: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()

    teamInvitationRepositoryMock.checkIfCodeHashExists.mockResolvedValue(false)
    teamInvitationRepositoryMock.revokeTeamInvitation.mockResolvedValue(true)
    teamInvitationRepositoryMock.acceptTeamInvitation.mockResolvedValue(true)
    service = new TeamInvitationService(teamInvitationRepositoryMock as never)
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

    expect(code).toMatchObject({
      teamId: 'team-1',
      role: 'player',
      maxUses: 5,
      expiresAt: '2026-06-30T10:00:00.000Z',
    })
    expect(code.code).toMatch(/^TNA-[A-Z2-9]{4}-[A-Z2-9]{4}$/)

    expect(teamInvitationRepositoryMock.createTeamInvitation).toHaveBeenCalledWith({
      createdById: 'user-1',
      codeHash: service.hashInvitationCode(code.code),
      teamId: 'team-1',
      role: 'player',
      maxUses: 5,
      expiresAt: new Date('2026-06-30T10:00:00.000Z'),
    })
  })

  it('revokes an invitation by ID', async () => {
    await service.revokeTeamInvitation({ invitationId: 'invitation-1', teamId: 'team-1' })

    expect(teamInvitationRepositoryMock.revokeTeamInvitation).toHaveBeenCalledWith({
      invitationId: 'invitation-1',
      teamId: 'team-1',
    })
  })

  it('throws NotFoundException when revoking a missing invitation', async () => {
    teamInvitationRepositoryMock.revokeTeamInvitation.mockResolvedValue(false)

    await expect(
      service.revokeTeamInvitation({ invitationId: 'missing', teamId: 'team-1' }),
    ).rejects.toThrow(NotFoundException)
  })

  it('accepts a reusable invitation', async () => {
    teamInvitationRepositoryMock.findValidInvitationByCodeHash.mockResolvedValue({
      id: 'invitation-1',
      assigned_to: null,
      team_id: 'team-1',
      role: 'player',
    })
    teamInvitationRepositoryMock.acceptTeamInvitation.mockResolvedValue(true)

    await expect(service.acceptTeamInvitation('TNA-ABCD-2345', 'user-1')).resolves.toEqual({
      teamId: 'team-1',
    })

    expect(teamInvitationRepositoryMock.findValidInvitationByCodeHash).toHaveBeenCalledWith(
      service.hashInvitationCode('TNA-ABCD-2345'),
    )

    expect(teamInvitationRepositoryMock.acceptTeamInvitation).toHaveBeenCalledWith({
      invitationId: 'invitation-1',
      userId: 'user-1',
      teamId: 'team-1',
      role: 'player',
    })
  })

  it('accepts a direct invitation assigned to the same user', async () => {
    teamInvitationRepositoryMock.findValidInvitationByCodeHash.mockResolvedValue({
      id: 'invitation-1',
      assigned_to: 'user-1',
      team_id: 'team-1',
      role: 'player',
    })
    teamInvitationRepositoryMock.acceptTeamInvitation.mockResolvedValue(true)

    await service.acceptTeamInvitation('TNA-ABCD-2345', 'user-1')

    expect(teamInvitationRepositoryMock.acceptTeamInvitation).toHaveBeenCalledWith({
      invitationId: 'invitation-1',
      userId: 'user-1',
      teamId: 'team-1',
      role: 'player',
    })
  })

  it('throws NotFoundException when invitation does not exist or is expired', async () => {
    teamInvitationRepositoryMock.findValidInvitationByCodeHash.mockResolvedValue(null)

    await expect(service.acceptTeamInvitation('TNA-ABCD-2345', 'user-1')).rejects.toThrow(
      NotFoundException,
    )

    expect(teamInvitationRepositoryMock.acceptTeamInvitation).not.toHaveBeenCalled()
  })

  it('throws NotFoundException when direct invitation is assigned to another user', async () => {
    teamInvitationRepositoryMock.findValidInvitationByCodeHash.mockResolvedValue({
      id: 'invitation-1',
      assigned_to: 'user-2',
      team_id: 'team-1',
      role: 'player',
    })

    await expect(service.acceptTeamInvitation('TNA-ABCD-2345', 'user-1')).rejects.toThrow(
      NotFoundException,
    )

    expect(teamInvitationRepositoryMock.acceptTeamInvitation).not.toHaveBeenCalled()
  })

  it('throws NotFoundException when invitation usage cannot be consumed', async () => {
    teamInvitationRepositoryMock.findValidInvitationByCodeHash.mockResolvedValue({
      id: 'invitation-1',
      assigned_to: null,
      team_id: 'team-1',
      role: 'player',
    })
    teamInvitationRepositoryMock.acceptTeamInvitation.mockResolvedValue(false)

    await expect(service.acceptTeamInvitation('TNA-ABCD-2345', 'user-1')).rejects.toThrow(
      NotFoundException,
    )
  })
})
