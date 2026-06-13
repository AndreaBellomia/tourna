import { UserRepository } from '~/user/user.repository'
import { TeamInvitationRepository } from './team-invitation.repository'
import { randomInt, createHash } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { TeamMembershipRole } from '@repo/domain'

const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

@Injectable()
export class TeamInvitationService {
  constructor(
    private readonly teamInvitations: TeamInvitationRepository,
    private readonly users: UserRepository,
  ) {}

  generateInvitationCode(): string {
    const part = (length: number) =>
      Array.from({ length }, () => INVITE_ALPHABET[randomInt(INVITE_ALPHABET.length)]).join('')

    return `TNA-${part(4)}-${part(4)}`
  }

  hashInvitationCode(code: string): string {
    return createHash('sha256').update(this.normalizeInvitationCode(code)).digest('hex')
  }

  normalizeInvitationCode(code: string): string {
    return code.trim().toUpperCase().replaceAll('-', '')
  }

  async createDirectInvitation({
    createdById,
    userId,
    teamId,
    role,
    expiresAt,
  }: {
    createdById: string
    userId: string
    teamId: string
    role: TeamMembershipRole
    maxUses?: number
    expiresAt: Date
  }): Promise<string> {
    const code = this.generateInvitationCode()

    await this.teamInvitations.createTeamInvitation({
      createdById,
      assignedToId: userId,
      codeHash: this.hashInvitationCode(code),
      teamId,
      role,
      maxUses: 1,
      expiresAt,
    })

    return code
  }

  async createReusableTeamInvitation({
    createdById,
    teamId,
    role,
    maxUses,
    expiresAt,
  }: {
    createdById: string
    teamId: string
    role: TeamMembershipRole
    maxUses?: number
    expiresAt: Date
  }) {
    const code = this.generateInvitationCode()

    await this.teamInvitations.createTeamInvitation({
      createdById,
      codeHash: this.hashInvitationCode(code),
      teamId,
      role,
      maxUses,
      expiresAt,
    })

    return code
  }

  async revokeTeamInvitation(invitationId: string): Promise<void> {
    await this.teamInvitations.revokeTeamInvitation(invitationId)
  }
}
