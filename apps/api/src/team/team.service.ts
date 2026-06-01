import { Injectable, NotFoundException } from '@nestjs/common'
import type { TeamDetailResponse, TeamListQuery, TeamListResponse } from '@repo/contracts'
import type { Visibility } from '@repo/domain'
import { TeamRepository } from './team.repository'

@Injectable()
export class TeamService {
  constructor(private readonly teams: TeamRepository) {}

  async getTeams(query: TeamListQuery): Promise<TeamListResponse> {
    const { search, visibility, ...pagination } = query

    return await this.teams.listTeams({
      filters: {
        ...(search ? { search } : {}),
        ...(visibility ? { visibility } : {}),
      },
      pagination,
    })
  }

  async getTeam(teamId: string): Promise<TeamDetailResponse> {
    const team = await this.teams.getTeamById(teamId)

    if (!team) {
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
