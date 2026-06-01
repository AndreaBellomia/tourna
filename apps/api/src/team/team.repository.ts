import { Injectable } from '@nestjs/common'
import { type CursorPaginatedResult, type CursorPaginationInput, paginateCursor } from '@repo/db'
import type { LifecycleStatus, Visibility } from '@repo/domain'
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

  async createTeam(user_id: string, name: string, description?: string, visibility?: Visibility) {
    const [team] = await this.database.db
      .insertInto('teams')
      .values({
        created_by_user_id: user_id,
        name,
        description: description ?? null,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        status: 'published',
        visibility: visibility ?? 'private',
      })
      .returningAll()
      .execute()

    return team ? this.getTeamById(team.id) : null
  }
}

function toTeamListItem(team: TeamListRow): TeamListItem {
  return {
    ...team,
    createdAt: team.createdAt.toISOString(),
  }
}
