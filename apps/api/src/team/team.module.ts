import { Module } from '@nestjs/common'
import { StorageModule } from '~/storage/storage.module'
import { TeamService } from './team.service'
import { TeamController } from './team.controller'
import { TeamRepository } from './team.repository'
import { TeamInvitationModule } from './invitations/team-invitation.module'

@Module({
  imports: [StorageModule, TeamInvitationModule],
  controllers: [TeamController],
  providers: [TeamService, TeamRepository],
})
export class TeamModule {}
