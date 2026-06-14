import { Injectable } from '@nestjs/common'
import { TeamMembershipRole } from '@repo/domain'
import { sql } from 'kysely'
import { DatabaseService } from '~/database/database.service'

type TeamInvitationLookup = {
  id: string
  team_id: string
  role: TeamMembershipRole
  assigned_to: string | null
  max_uses: number | null
  used_count: number
  expires_at: Date | null
}

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

  async findValidInvitationByCodeHash(codeHash: string): Promise<TeamInvitationLookup | undefined> {
    return await this.database.db
      .selectFrom('team_invitations')
      .where('code_hash', '=', codeHash)
      .where('status', '=', 'active')
      .where('expires_at', '>', new Date())
      .where((eb) => eb.or([eb('max_uses', 'is', null), eb('used_count', '<', eb.ref('max_uses'))]))
      .select(['id', 'team_id', 'role', 'assigned_to', 'max_uses', 'used_count', 'expires_at'])
      .executeTakeFirst()
  }

  async acceptTeamInvitation({
    invitationId,
    userId,
    teamId,
    role,
  }: {
    invitationId: string
    userId: string
    teamId: string
    role: TeamMembershipRole
  }): Promise<boolean> {
    return await this.database.db.transaction().execute(async (trx) => {
      const now = new Date()
      const consumedInvitation = await trx
        .updateTable('team_invitations')
        .set((eb) => ({
          used_count: sql<number>`${eb.ref('used_count')} + 1`,
        }))
        .where('id', '=', invitationId)
        .where('status', '=', 'active')
        .where('expires_at', '>', now)
        .where((eb) =>
          eb.or([eb('max_uses', 'is', null), eb('used_count', '<', eb.ref('max_uses'))]),
        )
        .returning(['id'])
        .executeTakeFirst()

      if (!consumedInvitation) {
        return false
      }

      await trx
        .insertInto('team_memberships')
        .values({
          user_id: userId,
          team_id: teamId,
          role,
          status: 'active',
          joined_at: now,
        })
        .execute()

      await trx
        .insertInto('team_invitation_uses')
        .values({
          user_id: userId,
          team_invitation_id: invitationId,
        })
        .execute()

      return true
    })
  }

  async checkIfCodeHashExists(codeHash: string): Promise<boolean> {
    const result = await this.database.db
      .selectFrom('team_invitations')
      .where('code_hash', '=', codeHash)
      .executeTakeFirst()

    return !!result
  }
}
