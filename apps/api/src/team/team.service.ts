import { Injectable, NotFoundException } from '@nestjs/common'
import type {
  TeamDetailResponse,
  TeamListQuery,
  TeamListResponse,
  UpdateTeamInput,
} from '@repo/contracts'
import type { Visibility } from '@repo/domain'
import { TeamRepository } from './team.repository'

@Injectable()
export class TeamService {
  constructor(private readonly teams: TeamRepository) {}

  async getTeams(query: TeamListQuery, viewerId?: string): Promise<TeamListResponse> {
    const { search, visibility, ...pagination } = query
    const effectiveVisibility = visibility ?? 'public'
    void viewerId

    if (effectiveVisibility !== 'public') {
      return {
        data: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          nextCursor: null,
          previousCursor: null,
        },
      }
    }

    return await this.teams.listTeams({
      filters: {
        ...(search ? { search } : {}),
        visibility: 'public',
      },
      pagination,
    })
  }

  async getTeam(teamId: string, viewerId?: string): Promise<TeamDetailResponse> {
    const team = await this.teams.getTeamDetailById(teamId, viewerId)

    if (!team) {
      throw new NotFoundException('Team not found')
    }

    if (team.visibility === 'private' && !team.viewerMembership) {
      throw new NotFoundException('Team not found')
    }

    return team
  }

  async createTeam(
    userId: string,
    name: string,
    description?: string,
    visibility?: Visibility,
  ): Promise<TeamDetailResponse> {
    const team = await this.teams.createTeam(userId, name, description, visibility)

    if (!team) {
      throw new NotFoundException('Team not found')
    }

    return team
  }

  async updateTeam(
    userId: string,
    teamId: string,
    updates: UpdateTeamInput,
  ): Promise<TeamDetailResponse> {
    const team = await this.teams.updateTeam(teamId, updates, userId)

    if (!team) {
      throw new NotFoundException('Team not found')
    }

    return team
  }

  joinTeam(userId: string, teamId: string) {
    void userId
    void teamId
  }

  leaveTeam(userId: string, teamId: string) {
    void userId
    void teamId
  }

  inviteToTeam(userId: string, teamId: string) {
    void userId
    void teamId
  }

  removeFromTeam(userId: string, teamId: string) {
    void userId
    void teamId
  }
}
