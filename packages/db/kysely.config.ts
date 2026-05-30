import { defineConfig, getKnexTimestampPrefix } from 'kysely-ctl'
import { Pool } from 'pg'
import { PostgresDialect } from 'kysely'

function buildDialectConfig() {
  if (process.env.DATABASE_URL) {
    return { pool: new Pool({ connectionString: process.env.DATABASE_URL }) }
  }

  return {
    pool: new Pool({
      host: process.env.PGHOST ?? 'localhost',
      port: Number(process.env.PGPORT ?? 5432),
      database: process.env.PGDATABASE ?? 'postgres',
      user: process.env.PGUSER ?? 'postgres',
      password: process.env.PGPASSWORD ?? '',
    }),
  }
}

export default defineConfig({
  dialect: new PostgresDialect(buildDialectConfig()),
  migrations: {
    migrationFolder: 'migrations',
    getMigrationPrefix: getKnexTimestampPrefix,
  },
})
