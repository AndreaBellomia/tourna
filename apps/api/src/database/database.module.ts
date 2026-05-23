import { Global, Module } from '@nestjs/common'
import { databaseProvider } from './database.factory'
import { DatabaseService } from './database.service'

@Global()
@Module({
  providers: [databaseProvider, DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
