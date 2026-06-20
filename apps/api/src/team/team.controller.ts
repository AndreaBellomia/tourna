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
import type { CursorPaginationQuery, TeamListResponse } from '@repo/contracts'
import {
  CreateTeamDto,
  TeamDetailResponseDto,
  TeamInvitationAcceptResponseDto,
  TeamInvitationDto,
  TeamInvitationCreateResponseDto,
  TeamListQueryDto,
  TeamListResponseDto,
  TeamRemoveUserDto,
  UpdateTeamDto,
  TeamInvitationResponseDto,
  TeamInvitationListResponseDto,
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
import { TeamInvitationService } from './invitations/team-invitation.service'

@Controller('teams')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly teamInvitationService: TeamInvitationService,
  ) {}

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
  async getTeam(
    @CurrentUser() user: JwtPayload | undefined,
    @Param('id') id: string,
  ): Promise<TeamDetailResponseDto> {
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
  async updateTeam(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: UpdateTeamDto,
  ): Promise<TeamDetailResponseDto> {
    return await this.teamService.updateTeam(user.userId, id, body)
  }

  @RequireTeamPolicy(Action.Manage)
  @Post(':id/invitations')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TeamInvitationCreateResponseDto })
  async createInvite(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: TeamInvitationDto,
  ): Promise<TeamInvitationCreateResponseDto> {
    return await this.teamInvitationService.createReusableTeamInvitation({
      createdById: user.userId,
      teamId: id,
      role: body.role,
      expiresAt: new Date(body.expiresAt),
      maxUses: body.maxUses,
    })
  }

  @RequireTeamMembership()
  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  leaveTeam(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.teamService.leaveTeam(user.userId, id)
  }

  @RequireTeamPolicy(Action.Manage)
  @Post(':id/remove-member')
  @HttpCode(HttpStatus.OK)
  removeMember(@Param('id') id: string, @Body() body: TeamRemoveUserDto) {
    return this.teamService.removeFromTeam(body.userId, id)
  }

  @Get(':id/invitations')
  @RequireTeamPolicy(Action.Manage)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TeamInvitationListResponseDto })
  async getInvitations(
    @Param('id') id: string,
    @Query() query: CursorPaginationQuery,
  ): Promise<TeamInvitationListResponseDto> {
    return await this.teamInvitationService.getInvitationsForTeam(query, id)
  }

  @RequireTeamPolicy(Action.Manage)
  @Post(':id/invitations/:invitationId/revoke')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeInvitation(
    @Param('id') id: string,
    @Param('invitationId') invitationId: string,
  ): Promise<void> {
    await this.teamInvitationService.revokeTeamInvitation({ invitationId, teamId: id })
  }

  @Post('invitations/:code/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TeamInvitationAcceptResponseDto })
  async acceptInvite(
    @CurrentUser() user: JwtPayload,
    @Param('code') code: string,
  ): Promise<TeamInvitationAcceptResponseDto> {
    return await this.teamInvitationService.acceptTeamInvitation(code, user.userId)
  }
}
