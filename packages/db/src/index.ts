export * from './database'
export * from './schema'
export * from './migrator'
import type { CreateConnectionsOptions } from './database'

function buildConnOptions(): CreateConnectionsOptions {
  if (process.env.DATABASE_URL) return { connectionString: process.env.DATABASE_URL }

  return {
    host: process.env.PGHOST ?? 'localhost',
    port: Number(process.env.PGPORT ?? 5432),
    database: process.env.PGDATABASE ?? 'postgres',
    user: process.env.PGUSER ?? 'postgres',
    password: process.env.PGPASSWORD ?? '',
  }
}

export async function migrateToLatest() {
  const { createMigrator } = await import('./migrator')
  const { createConnections } = await import('./database')
  const connections = createConnections(buildConnOptions())
  const migrator = createMigrator({ db: connections.db })

  try {
    await migrator.up()
  } finally {
    await connections.destroy()
  }
}

export async function migrateDown() {
  const { createMigrator } = await import('./migrator')
  const { createConnections } = await import('./database')
  const connections = createConnections(buildConnOptions())
  const migrator = createMigrator({ db: connections.db })

  try {
    await migrator.down()
  } finally {
    await connections.destroy()
  }
}
