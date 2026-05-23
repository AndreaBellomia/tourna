import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common'
import { KyselyDatabase } from '@repo/db'
import { DB_CONNECTION } from './database.token'

type DbConnection = {
  db: KyselyDatabase
  destroy: () => Promise<void> | void
}

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly connection: DbConnection,
  ) {}

  get db() {
    return this.connection.db
  }

  async onModuleDestroy() {
    await this.connection.destroy()
  }
}
