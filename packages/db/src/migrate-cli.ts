import { createMigrator } from './migrator'
import { createConnections, type CreateConnectionsOptions } from './database'

const command = process.argv[2]

function buildConnOptions(): CreateConnectionsOptions {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL }
  }

  return {
    host: process.env.PGHOST ?? 'localhost',
    port: Number(process.env.PGPORT ?? 5432),
    database: process.env.PGDATABASE ?? 'postgres',
    user: process.env.PGUSER ?? 'postgres',
    password: process.env.PGPASSWORD ?? '',
  }
}

async function main() {
  const connections = createConnections(buildConnOptions())

  await connections.db.schema
    .createTable('kysely_migrations')
    .ifNotExists()
    .addColumn('name', 'text', (c) => c.primaryKey())
    .addColumn('run_on', 'timestamptz', (c) => c.notNull())
    .execute()

  const migrator = createMigrator({ db: connections.db })

  try {
    if (command === 'up') {
      const results = await migrator.up()
      console.log('Migrations applied:', results)
    } else if (command === 'down') {
      const results = await migrator.down()
      console.log('Migration reverted:', results)
    } else if (command === 'status') {
      const pending = await migrator.pending()
      const executed = await migrator.executed()
      console.log('Executed:', executed)
      console.log(
        'Pending:',
        pending.map((m) => m.name),
      )
    } else {
      console.error('Usage: migrate-cli <up|down|status>')
      process.exit(1)
    }
  } finally {
    await connections.destroy()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
