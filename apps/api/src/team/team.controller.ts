import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiOkResponse } from '@nestjs/swagger'
import { Action } from '@repo/authorization'
import type { TeamListResponse } from '@repo/contracts'
import {
  CreateTeamDto,
  TeamListQueryDto,
  TeamListResponseDto,
  UpdateTeamDto,
} from '@repo/contracts/nest'
import type { JwtPayload } from '@repo/domain'
import {
  RequireTeamManagement,
  RequireTeamMembership,
  RequireTeamPolicy,
} from '~/authorization/decorators/team-policy.decorator'
import { CurrentUser } from '~/common/decorators/current-user.decorator'
import { Public } from '~/common/decorators/public.decorator'
import { TeamService } from './team.service'

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TeamListResponseDto })
  async getTeams(
    @CurrentUser() user: JwtPayload | undefined,
    @Query() query: TeamListQueryDto,
  ): Promise<TeamListResponse> {
    return await this.teamService.getTeams(query, user?.userId)
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getTeam(@CurrentUser() user: JwtPayload | undefined, @Param('id') id: string) {
    return await this.teamService.getTeam(id, user?.userId)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createTeam(@CurrentUser() user: JwtPayload, @Body() body: CreateTeamDto) {
    return this.teamService.createTeam(
      user.userId,
      body.name,
      body.tag,
      body.description,
      body.visibility,
    )
  }

  @RequireTeamManagement()
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  updateTeam(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: UpdateTeamDto,
  ) {
    return this.teamService.updateTeam(user.userId, id, body)
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  joinTeam(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.teamService.joinTeam(user.userId, id)
  }

  @RequireTeamMembership()
  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  leaveTeam(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.teamService.leaveTeam(user.userId, id)
  }

  @RequireTeamPolicy(Action.Invite)
  @Post(':id/invite')
  @HttpCode(HttpStatus.OK)
  inviteToTeam(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.teamService.inviteToTeam(user.userId, id)
  }

  @RequireTeamManagement()
  @Post(':id/remove')
  @HttpCode(HttpStatus.OK)
  removeFromTeam(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.teamService.removeFromTeam(user.userId, id)
  }
}
