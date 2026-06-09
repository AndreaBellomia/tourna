import { Module } from '@nestjs/common'
import { StorageModule } from '~/storage/storage.module'
import { UserController } from './user.controller'
import { UserRepository } from './user.repository'
import { UserService } from './user.service'

@Module({
  imports: [StorageModule],
  controllers: [UserController],
  providers: [UserRepository, UserService],
})
export class UserModule {}
