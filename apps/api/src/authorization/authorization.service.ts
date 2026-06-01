import { Injectable } from '@nestjs/common'
import { Action, buildAbility, Subject, teamSubject, userSubject } from '@repo/authorization'
import { CacheService } from '../cache/cache.service'
import { CacheKeys } from '@repo/redis'
import { DatabaseService } from '../database/database.service'
import type { DatabaseSchema } from '@repo/db'
import type { Selectable } from 'kysely'
import { AppConfigService } from '../config/config.service'
import type { TeamMembershipRole } from '@repo/domain'

type TeamAuthorizationTarget = Pick<Selectable<DatabaseSchema['teams']>, 'id' | 'organization_id'>
type TeamMembership = Pick<
  Selectable<DatabaseSchema['team_memberships']>,
  'id' | 'team_id' | 'user_id' | 'role' | 'status'
>

const TEAM_MANAGEMENT_ROLES = new Set<TeamMembershipRole>(['owner', 'captain', 'manager'])

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly databaseService: DatabaseService,
    private readonly configService: AppConfigService,
  ) {}

  async getByUser(userId: string): Promise<Selectable<DatabaseSchema['memberships']>[]> {
    return this.cacheService.getOrSet(
      CacheKeys.memberships(userId),
      () =>
        this.databaseService.db
          .selectFrom('memberships')
          .selectAll()
          .where('user_id', '=', userId)
          .where('status', '=', 'active')
          .execute(),
      this.configService.get('CACHE_DURATION_AUTHORIZATION'),
    )
  }

  async build(userId: string) {
    const memberships = await this.getByUser(userId)
    return buildAbility(memberships)
  }

  async check(userId: string, action: Action, subject: Subject) {
    const ability = await this.build(userId)
    return ability.can(action, subject)
  }

  async canAccessTeamAction(userId: string, teamId: string, action: Action): Promise<boolean> {
    const team = await this.getTeamAuthorizationTarget(teamId)
    if (!team) return false

    const appAbility = await this.build(userId)
    const target = teamSubject({
      id: team.id,
      organizationId: team.organization_id,
    })

    if (appAbility.can(action, target)) return true

    if (action === Action.Invite) {
      const targetUser = userSubject({ teamId: team.id })
      if (appAbility.can(Action.Invite, targetUser)) return true
    }

    const teamMembership = await this.getActiveTeamMembership(userId, teamId)
    if (!teamMembership) return false

    return this.canTeamMembershipPerform(teamMembership.role, action)
  }

  async hasActiveTeamMembership(userId: string, teamId: string): Promise<boolean> {
    const membership = await this.getActiveTeamMembership(userId, teamId)
    return Boolean(membership)
  }

  async getTeamAuthorizationTarget(teamId: string): Promise<TeamAuthorizationTarget | null> {
    return this.cacheService.getOrSet(
      CacheKeys.teamAuthorizationTarget(teamId),
      async () => {
        const team = await this.databaseService.db
          .selectFrom('teams')
          .select(['id', 'organization_id'])
          .where('id', '=', teamId)
          .executeTakeFirst()

        return team ?? null
      },
      this.configService.get('CACHE_DURATION_AUTHORIZATION'),
    )
  }

  async getActiveTeamMembership(userId: string, teamId: string): Promise<TeamMembership | null> {
    return this.cacheService.getOrSet(
      CacheKeys.teamMembership(userId, teamId),
      async () => {
        const membership = await this.databaseService.db
          .selectFrom('team_memberships')
          .select(['id', 'team_id', 'user_id', 'role', 'status'])
          .where('team_id', '=', teamId)
          .where('user_id', '=', userId)
          .where('status', '=', 'active')
          .where('left_at', 'is', null)
          .executeTakeFirst()

        return membership ?? null
      },
      this.configService.get('CACHE_DURATION_AUTHORIZATION'),
    )
  }

  private canTeamMembershipPerform(role: TeamMembershipRole, action: Action): boolean {
    if (action === Action.Read) return true

    const isManagementAction =
      action === Action.Manage ||
      action === Action.Update ||
      action === Action.Delete ||
      action === Action.Invite

    return isManagementAction ? TEAM_MANAGEMENT_ROLES.has(role) : false
  }
}
