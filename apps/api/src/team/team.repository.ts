import { Injectable } from '@nestjs/common'
import { type CursorPaginatedResult, type CursorPaginationInput, paginateCursor } from '@repo/db'
import type { LifecycleStatus, TeamMembershipRole, Visibility } from '@repo/domain'
import { DatabaseService } from '../database/database.service'

type TeamListRow = {
  id: string
  name: string
  slug: string
  tag: string
  status: LifecycleStatus
  visibility: Visibility
  description: string | null
  logoObjectKey: string | null
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
  members: TeamMemberItem[]
}

export type TeamMemberItem = {
  role: TeamMembershipRole
  joinedAt: string
  user: {
    id: string
    display_name: string
    nickname: string
    avatarObjectKey: string | null
  }
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
        'tag',
        'status',
        'visibility',
        'description',
        'logo_object_key as logoObjectKey',
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
          eb('tag', 'ilike', pattern),
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

  async getTeamByIdentifier(identifier: string): Promise<TeamListItem | null> {
    let query = this.database.db
      .selectFrom('teams')
      .select([
        'id',
        'name',
        'slug',
        'tag',
        'status',
        'visibility',
        'description',
        'logo_object_key as logoObjectKey',
        'created_at as createdAt',
      ])

    query = isNumericIdentifier(identifier)
      ? query.where((eb) => eb.or([eb('id', '=', identifier), eb('slug', '=', identifier)]))
      : query.where('slug', '=', identifier)

    const team = await query.executeTakeFirst()

    if (!team) {
      return null
    }

    return toTeamListItem(team)
  }

  async getTeamDetailByIdentifier(
    identifier: string,
    viewerId?: string,
  ): Promise<TeamDetailItem | null> {
    const team = await this.getTeamByIdentifier(identifier)

    if (!team) {
      return null
    }

    return {
      ...team,
      viewerMembership: viewerId ? await this.getViewerMembership(team.id, viewerId) : null,
      members: await this.getTeamMembers(team.id),
    }
  }

  async createTeam(
    userId: string,
    name: string,
    tag: string,
    description?: string,
    visibility?: Visibility,
  ) {
    const teamId = await this.database.db.transaction().execute(async (trx) => {
      const [team] = await trx
        .insertInto('teams')
        .values({
          created_by_user_id: userId,
          name,
          tag: normalizeTeamTag(tag),
          description: description ?? null,
          slug: await this.buildAvailableTeamSlug(name),
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

    return teamId ? this.getTeamDetailByIdentifier(teamId, userId) : null
  }

  async updateTeam(
    teamId: string,
    updates: {
      name?: string
      tag?: string
      description?: string
      logoObjectKey?: string | null
      visibility?: Visibility
    },
    viewerId?: string,
  ): Promise<TeamDetailItem | null> {
    const values = {
      ...(updates.name
        ? { name: updates.name, slug: await this.buildAvailableTeamSlug(updates.name, teamId) }
        : {}),
      ...(updates.tag ? { tag: normalizeTeamTag(updates.tag) } : {}),
      ...(updates.description !== undefined ? { description: updates.description || null } : {}),
      ...('logoObjectKey' in updates ? { logo_object_key: updates.logoObjectKey || null } : {}),
      ...(updates.visibility ? { visibility: updates.visibility } : {}),
      updated_at: new Date(),
    }

    const [team] = await this.database.db
      .updateTable('teams')
      .set(values)
      .where('id', '=', teamId)
      .returning(['id'])
      .execute()

    return team ? this.getTeamDetailByIdentifier(team.id, viewerId) : null
  }

  async getTeamMembers(teamId: string): Promise<TeamMemberItem[]> {
    const members = await this.database.db
      .selectFrom('team_memberships')
      .innerJoin('users', 'users.id', 'team_memberships.user_id')
      .select([
        'team_memberships.role',
        'team_memberships.joined_at as joinedAt',
        'users.id as userId',
        'users.display_name as displayName',
        'users.nickname',
        'users.avatar_object_key as avatarObjectKey',
      ])
      .where('team_memberships.team_id', '=', teamId)
      .where('team_memberships.status', '=', 'active')
      .where('team_memberships.left_at', 'is', null)
      .where('users.deleted_at', 'is', null)
      .orderBy('team_memberships.joined_at', 'asc')
      .execute()

    return members.map((member) => ({
      role: member.role,
      joinedAt: member.joinedAt.toISOString(),
      user: {
        id: member.userId,
        display_name: member.displayName,
        nickname: member.nickname,
        avatarObjectKey: member.avatarObjectKey,
      },
    }))
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

  private async buildAvailableTeamSlug(name: string, excludeTeamId?: string): Promise<string> {
    const base = buildTeamSlug(name)

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const slug = attempt === 0 ? base : `${base}-${attempt + 1}`
      let query = this.database.db.selectFrom('teams').select('id').where('slug', '=', slug)

      if (excludeTeamId) {
        query = query.where('id', '!=', excludeTeamId)
      }

      const existing = await query.executeTakeFirst()

      if (!existing) {
        return slug
      }
    }

    return `${base}-${Date.now().toString(36)}`
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

function normalizeTeamTag(tag: string) {
  return tag.toUpperCase()
}

function isNumericIdentifier(identifier: string) {
  return /^\d+$/.test(identifier)
}

function isTeamManagementRole(role: TeamMembershipRole) {
  return role === 'owner' || role === 'captain' || role === 'manager'
}
