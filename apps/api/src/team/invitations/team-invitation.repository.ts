import { Injectable } from '@nestjs/common'
import { TeamMembershipRole } from '@repo/domain'
import { DatabaseService } from '~/database/database.service'

@Injectable()
export class TeamInvitationRepository {
  constructor(private readonly database: DatabaseService) {}

  async createTeamInvitation({
    teamId,
    codeHash,
    createdById,
    assignedToId,
    role,
    maxUses,
    expiresAt,
  }: {
    createdById: string
    assignedToId?: string
    codeHash: string
    teamId: string
    role: TeamMembershipRole
    maxUses?: number
    expiresAt: Date
  }) {
    return await this.database.db
      .insertInto('team_invitations')
      .values({
        team_id: teamId,
        code_hash: codeHash,
        created_by: createdById,
        assigned_to: assignedToId ?? null,
        role,
        max_uses: maxUses ?? null,
        expires_at: expiresAt,
        used_count: 0,
        status: 'active',
      })
      .returningAll()
      .executeTakeFirstOrThrow()
  }

  async revokeTeamInvitation(invitationId: string) {
    await this.database.db
      .updateTable('team_invitations')
      .set({ status: 'revoked' })
      .where('id', '=', invitationId)
      .execute()
  }
}
