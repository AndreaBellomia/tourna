import { Module } from '@nestjs/common'
import { StorageModule } from '~/storage/storage.module'
import { TeamService } from './team.service'
import { TeamController } from './team.controller'
import { TeamRepository } from './team.repository'

@Module({
  imports: [StorageModule],
  controllers: [TeamController],
  providers: [TeamService, TeamRepository],
})
export class TeamModule {}
