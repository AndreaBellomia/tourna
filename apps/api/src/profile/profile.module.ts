import { Module } from '@nestjs/common'
import { StorageModule } from '../storage/storage.module'
import { ProfileService } from './profile.service'
import { ProfileController } from './profile.controller'
import { ProfileRepository } from './profile.repository'

@Module({
  imports: [StorageModule],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository],
})
export class ProfileModule {}
