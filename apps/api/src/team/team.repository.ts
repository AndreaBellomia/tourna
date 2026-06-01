import { Injectable } from '@nestjs/common'
import { type CursorPaginatedResult, type CursorPaginationInput, paginateCursor } from '@repo/db'
import type { LifecycleStatus, TeamMembershipRole, Visibility } from '@repo/domain'
import { DatabaseService } from '../database/database.service'

type TeamListRow = {
  id: string
  name: string
  slug: string
  status: LifecycleStatus
  visibility: Visibility
  description: string | null
  createdAt: Date
}

export type TeamListItem = Omit<TeamListRow, 'createdAt'> & {
  createdAt: string
}

export type TeamViewerMembership = {
  role: TeamMembershipRole
  canManage: boolean
}

export type TeamDetailItem = TeamListItem & {
  viewerMembership: TeamViewerMembership | null
}

export type TeamListFilters = {
  search?: string
  status?: LifecycleStatus
  visibility?: Visibility
}

export type ListTeamsInput = {
  filters?: TeamListFilters
  pagination: CursorPaginationInput
}

@Injectable()
export class TeamRepository {
  constructor(private readonly database: DatabaseService) {}

  async listTeams(input: ListTeamsInput): Promise<CursorPaginatedResult<TeamListItem>> {
    let query = this.database.db
      .selectFrom('teams')
      .select([
        'id',
        'name',
        'slug',
        'status',
        'visibility',
        'description',
        'created_at as createdAt',
      ])

    if (input.filters?.status) {
      query = query.where('status', '=', input.filters.status)
    }

    if (input.filters?.visibility) {
      query = query.where('visibility', '=', input.filters.visibility)
    }

    if (input.filters?.search) {
      const pattern = `%${input.filters.search}%`

      query = query.where((eb) =>
        eb.or([
          eb('name', 'ilike', pattern),
          eb('slug', 'ilike', pattern),
          eb('description', 'ilike', pattern),
        ]),
      )
    }

    return await paginateCursor(query, {
      pagination: input.pagination,
      filters: input.filters,
      cursor: {
        column: 'created_at',
        outputKey: 'createdAt',
        idColumn: 'id',
        direction: 'desc',
      },
      mapItem: toTeamListItem,
    })
  }

  async getTeamById(id: string): Promise<TeamListItem | null> {
    const team = await this.database.db
      .selectFrom('teams')
      .select([
        'id',
        'name',
        'slug',
        'status',
        'visibility',
        'description',
        'created_at as createdAt',
      ])
      .where('id', '=', id)
      .executeTakeFirst()

    if (!team) {
      return null
    }

    return toTeamListItem(team)
  }

  async getTeamDetailById(id: string, viewerId?: string): Promise<TeamDetailItem | null> {
    const team = await this.getTeamById(id)

    if (!team) {
      return null
    }

    return {
      ...team,
      viewerMembership: viewerId ? await this.getViewerMembership(id, viewerId) : null,
    }
  }

  async createTeam(userId: string, name: string, description?: string, visibility?: Visibility) {
    const teamId = await this.database.db.transaction().execute(async (trx) => {
      const [team] = await trx
        .insertInto('teams')
        .values({
          created_by_user_id: userId,
          name,
          description: description ?? null,
          slug: buildTeamSlug(name),
          status: 'published',
          visibility: visibility ?? 'private',
        })
        .returning(['id'])
        .execute()

      if (!team) {
        return null
      }

      await trx
        .insertInto('team_memberships')
        .values({
          team_id: team.id,
          user_id: userId,
          role: 'owner',
          status: 'active',
          joined_at: new Date(),
        })
        .execute()

      return team.id
    })

    return teamId ? this.getTeamDetailById(teamId, userId) : null
  }

  async updateTeam(
    teamId: string,
    updates: { name?: string; description?: string; visibility?: Visibility },
    viewerId?: string,
  ): Promise<TeamDetailItem | null> {
    const values = {
      ...(updates.name ? { name: updates.name, slug: buildTeamSlug(updates.name) } : {}),
      ...(updates.description !== undefined ? { description: updates.description || null } : {}),
      ...(updates.visibility ? { visibility: updates.visibility } : {}),
      updated_at: new Date(),
    }

    const [team] = await this.database.db
      .updateTable('teams')
      .set(values)
      .where('id', '=', teamId)
      .returning(['id'])
      .execute()

    return team ? this.getTeamDetailById(team.id, viewerId) : null
  }

  async getViewerMembership(teamId: string, userId: string): Promise<TeamViewerMembership | null> {
    const membership = await this.database.db
      .selectFrom('team_memberships')
      .select(['role'])
      .where('team_id', '=', teamId)
      .where('user_id', '=', userId)
      .where('status', '=', 'active')
      .where('left_at', 'is', null)
      .executeTakeFirst()

    if (!membership) {
      return null
    }

    return {
      role: membership.role,
      canManage: isTeamManagementRole(membership.role),
    }
  }
}

function toTeamListItem(team: TeamListRow): TeamListItem {
  return {
    ...team,
    createdAt: team.createdAt.toISOString(),
  }
}

function buildTeamSlug(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'team'
  )
}

function isTeamManagementRole(role: TeamMembershipRole) {
  return role === 'owner' || role === 'captain' || role === 'manager'
}
