import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type {
  TeamDetailResponse,
  TeamListQuery,
  TeamListResponse,
  UpdateTeamInput,
} from '@repo/contracts'
import type { Visibility } from '@repo/domain'
import { StorageService } from '../storage/storage.service'
import { TeamRepository, type TeamDetailItem } from './team.repository'

@Injectable()
export class TeamService {
  constructor(
    private readonly teams: TeamRepository,
    private readonly storage: StorageService,
  ) {}

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

    const result = await this.teams.listTeams({
      filters: {
        ...(search ? { search } : {}),
        visibility: 'public',
      },
      pagination,
    })

    return {
      ...result,
      data: await Promise.all(
        result.data.map(async (team) => ({
          ...team,
          logoUrl: await this.storage.createPublicObjectReadUrl(team.logoObjectKey),
        })),
      ),
    }
  }

  async getTeam(teamId: string, viewerId?: string): Promise<TeamDetailResponse> {
    const team = await this.teams.getTeamDetailByIdentifier(teamId, viewerId)

    if (!team) {
      throw new NotFoundException('Team not found')
    }

    if (team.visibility === 'private' && !team.viewerMembership) {
      throw new NotFoundException('Team not found')
    }

    return await this.withMemberAvatarUrls(team)
  }

  async createTeam(
    userId: string,
    name: string,
    tag: string,
    description?: string,
    visibility?: Visibility,
  ): Promise<TeamDetailResponse> {
    const team = await this.teams.createTeam(userId, name, tag, description, visibility)

    if (!team) {
      throw new NotFoundException('Team not found')
    }

    return await this.withMemberAvatarUrls(team)
  }

  async updateTeam(
    userId: string,
    teamId: string,
    updates: UpdateTeamInput,
  ): Promise<TeamDetailResponse> {
    if (!isValidTeamLogoKey(updates.logoObjectKey, teamId)) {
      throw new BadRequestException('Logo object key does not belong to this team')
    }

    const team = await this.teams.updateTeam(teamId, updates, userId)

    if (!team) {
      throw new NotFoundException('Team not found')
    }

    return await this.withMemberAvatarUrls(team)
  }

  private async withMemberAvatarUrls(team: TeamDetailItem): Promise<TeamDetailResponse> {
    return {
      ...team,
      logoUrl: await this.storage.createPublicObjectReadUrl(team.logoObjectKey),
      members: await Promise.all(
        team.members.map(async (member) => ({
          ...member,
          user: {
            ...member.user,
            avatarUrl: await this.storage.createPublicObjectReadUrl(member.user.avatarObjectKey),
          },
        })),
      ),
    }
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

function isValidTeamLogoKey(key: string | null | undefined, teamId: string) {
  if (key === undefined || key === null) {
    return true
  }

  const parts = key.split('/')

  return (
    parts[0] === 'public' && parts[1] === 'team_logo' && parts[2] === 'teams' && parts[5] === teamId
  )
}
