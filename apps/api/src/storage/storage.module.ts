import { Module } from '@nestjs/common'
import { StorageController } from './storage.controller'
import { storageProvider } from './storage.factory'
import { StorageService } from './storage.service'

@Module({
  controllers: [StorageController],
  providers: [storageProvider, StorageService],
  exports: [StorageService],
})
export class StorageModule {}
