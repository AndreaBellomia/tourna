import { Module } from '@nestjs/common'
import { TeamInvitationRepository } from './team-invitation.repository'
import { TeamInvitationService } from './team-invitation.service'

@Module({
  imports: [],
  controllers: [],
  providers: [TeamInvitationService, TeamInvitationRepository],
})
export class TeamInvitationModule {}
