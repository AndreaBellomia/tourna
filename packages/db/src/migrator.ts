import path from 'path'
import { Umzug, type MigrationFn } from 'umzug'
import type { KyselyConnections, KyselyDatabase } from './database'
import { Kysely } from 'kysely'
import { DatabaseSchema } from './schema'

export type DbMigration = MigrationFn<KyselyDatabase>

export function createMigrator(connections: Pick<KyselyConnections, 'db'>) {
  const { db } = connections as unknown as {
    db: Kysely<DatabaseSchema & { kysely_migrations: { name: string; run_on: Date } }>
  }

  const ensureMigrationsTable = async () => {
    await db.schema
      .createTable('kysely_migrations')
      .ifNotExists()
      .addColumn('name', 'text', (c) => c.primaryKey())
      .addColumn('run_on', 'timestamptz', (c) => c.notNull())
      .execute()
  }

  return new Umzug<KyselyDatabase>({
    migrations: {
      glob: path.join(__dirname, '../migrations/*.{js,ts}'),
    },

    context: db as unknown as Kysely<DatabaseSchema>,

    storage: {
      async logMigration({ name }) {
        await ensureMigrationsTable()
        await db.insertInto('kysely_migrations').values({ name, run_on: new Date() }).execute()
      },

      async unlogMigration({ name }) {
        await ensureMigrationsTable()
        await db.deleteFrom('kysely_migrations').where('name', '=', name).execute()
      },

      async executed() {
        await ensureMigrationsTable()
        const rows = await db.selectFrom('kysely_migrations').select('name').execute()

        return rows.map((r: { name: string }) => r.name)
      },
    },

    logger: console,
  })
}
