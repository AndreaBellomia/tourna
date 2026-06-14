import { TeamInvitationRepository } from './team-invitation.repository'
import { randomInt, createHash } from 'node:crypto'
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import type { TeamInvitationAcceptResponse, TeamInvitationResponse } from '@repo/contracts'
import { TeamMembershipRole } from '@repo/domain'

const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const INVITE_CODE_MAX_ATTEMPTS = 8

@Injectable()
export class TeamInvitationService {
  constructor(private readonly teamInvitations: TeamInvitationRepository) {}

  async generateInvitationCode(): Promise<string> {
    for (let attempt = 0; attempt < INVITE_CODE_MAX_ATTEMPTS; attempt += 1) {
      const code = `TNA-${generateCodePart(4)}-${generateCodePart(4)}`

      if (!(await this.teamInvitations.checkIfCodeHashExists(this.hashInvitationCode(code)))) {
        return code
      }
    }

    throw new InternalServerErrorException('Unable to generate invitation code')
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
    expiresAt: Date
  }): Promise<TeamInvitationResponse> {
    const code = await this.generateInvitationCode()

    await this.teamInvitations.createTeamInvitation({
      createdById,
      assignedToId: userId,
      codeHash: this.hashInvitationCode(code),
      teamId,
      role,
      maxUses: 1,
      expiresAt,
    })

    return {
      code,
      teamId,
      role,
      maxUses: 1,
      expiresAt: expiresAt.toISOString(),
    }
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
  }): Promise<TeamInvitationResponse> {
    const code = await this.generateInvitationCode()

    await this.teamInvitations.createTeamInvitation({
      createdById,
      codeHash: this.hashInvitationCode(code),
      teamId,
      role,
      maxUses,
      expiresAt,
    })

    return {
      code,
      teamId,
      role,
      maxUses: maxUses ?? null,
      expiresAt: expiresAt.toISOString(),
    }
  }

  async revokeTeamInvitation(invitationId: string): Promise<void> {
    await this.teamInvitations.revokeTeamInvitation(invitationId)
  }

  async acceptTeamInvitation(
    invitationCode: string,
    userId: string,
  ): Promise<TeamInvitationAcceptResponse> {
    const codeHash = this.hashInvitationCode(invitationCode)
    const invitation = await this.teamInvitations.findValidInvitationByCodeHash(codeHash)

    if (!invitation) {
      throw new NotFoundException('Invitation not found or expired')
    }

    if (invitation.assigned_to && invitation.assigned_to !== userId) {
      throw new NotFoundException('Invitation not found or expired')
    }

    const accepted = await this.teamInvitations.acceptTeamInvitation({
      invitationId: invitation.id,
      userId,
      teamId: invitation.team_id,
      role: invitation.role,
    })

    if (!accepted) {
      throw new NotFoundException('Invitation not found or expired')
    }

    return {
      teamId: invitation.team_id,
    }
  }
}

function generateCodePart(length: number) {
  return Array.from({ length }, () => INVITE_ALPHABET[randomInt(INVITE_ALPHABET.length)]).join('')
}
