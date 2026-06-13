import { sql } from 'kysely'
import { Migrator } from 'kysely/migration'
import { Client } from 'pg'
import { createConnections, type KyselyConnections, type KyselyDatabase } from '../database'
import { createTestMigrationProvider } from './migrations'

const DEFAULT_ADMIN_DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/postgres'
const DEFAULT_DATABASE_PREFIX = 'tourna_test'
const MIGRATION_TABLES = new Set(['kysely_migration', 'kysely_migration_lock'])

export type TestDatabaseEnvironment = {
  db: KyselyDatabase
  connectionString: string
  databaseName: string
  reset: () => Promise<void>
  destroy: (options?: { dropDatabase?: boolean }) => Promise<void>
}

export type CreateWorkerTestDatabaseOptions = {
  adminDatabaseUrl?: string
  databasePrefix?: string
  workerId?: string
  poolMax?: number
}

export async function createWorkerTestDatabase(
  options: CreateWorkerTestDatabaseOptions = {},
): Promise<TestDatabaseEnvironment> {
  const adminDatabaseUrl =
    options.adminDatabaseUrl ??
    process.env.TOURNA_TEST_DATABASE_URL ??
    process.env.TEST_DATABASE_URL ??
    DEFAULT_ADMIN_DATABASE_URL
  const workerId = options.workerId ?? process.env.JEST_WORKER_ID ?? '1'
  const databaseName = buildWorkerDatabaseName(options.databasePrefix, workerId)
  const connectionString = buildDatabaseUrl(adminDatabaseUrl, databaseName)

  await recreateDatabase(adminDatabaseUrl, databaseName)

  const connections = createConnections({
    connectionString,
    max: options.poolMax ?? 4,
  })

  try {
    await runMigrations(connections.db)
  } catch (error) {
    await connections.destroy()
    await dropDatabase(adminDatabaseUrl, databaseName)
    throw error
  }

  return {
    db: connections.db,
    connectionString,
    databaseName,
    reset: () => resetTestDatabase(connections.db),
    destroy: async ({ dropDatabase: shouldDropDatabase = true } = {}) => {
      await destroyEnvironment(connections, adminDatabaseUrl, databaseName, shouldDropDatabase)
    },
  }
}

export async function resetTestDatabase(db: KyselyDatabase) {
  const tables = await getApplicationTables(db)

  if (tables.length === 0) {
    return
  }

  await sql
    .raw(`truncate table ${tables.map(quoteIdentifier).join(', ')} restart identity cascade`)
    .execute(db)
}

async function runMigrations(db: KyselyDatabase) {
  const migrator = new Migrator({
    db,
    provider: createTestMigrationProvider(),
  })

  const { error, results } = await migrator.migrateToLatest()

  if (error) {
    const failedMigration = results?.find((result) => result.status === 'Error')
    const detail = failedMigration ? ` while running ${failedMigration.migrationName}` : ''

    throw new Error(`Failed to migrate test database${detail}: ${formatError(error)}`)
  }
}

async function recreateDatabase(adminDatabaseUrl: string, databaseName: string) {
  await dropDatabase(adminDatabaseUrl, databaseName)
  await withAdminClient(adminDatabaseUrl, async (client) => {
    await client.query(`create database ${quoteIdentifier(databaseName)}`)
  })
}

async function dropDatabase(adminDatabaseUrl: string, databaseName: string) {
  await withAdminClient(adminDatabaseUrl, async (client) => {
    await client.query(`drop database if exists ${quoteIdentifier(databaseName)} with (force)`)
  })
}

async function destroyEnvironment(
  connections: KyselyConnections,
  adminDatabaseUrl: string,
  databaseName: string,
  shouldDropDatabase: boolean,
) {
  await connections.destroy()

  if (shouldDropDatabase) {
    await dropDatabase(adminDatabaseUrl, databaseName)
  }
}

async function getApplicationTables(db: KyselyDatabase) {
  const rows = await sql<{ table_name: string }>`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
    order by table_name
  `.execute(db)

  return rows.rows
    .map((row) => row.table_name)
    .filter((tableName) => !MIGRATION_TABLES.has(tableName))
}

async function withAdminClient<T>(
  adminDatabaseUrl: string,
  callback: (client: Client) => Promise<T>,
) {
  const client = new Client({ connectionString: adminDatabaseUrl })

  try {
    await client.connect()
  } catch (error) {
    throw new Error(
      `Failed to connect to PostgreSQL admin database: ${describeDatabaseUrl(adminDatabaseUrl)}`,
      {
        cause: error,
      },
    )
  }

  try {
    return await callback(client)
  } finally {
    await client.end()
  }
}

function buildWorkerDatabaseName(databasePrefix = DEFAULT_DATABASE_PREFIX, workerId: string) {
  const safePrefix = sanitizeIdentifier(databasePrefix)
  const safeWorkerId = sanitizeIdentifier(workerId)
  const name = `${safePrefix}_${safeWorkerId}`

  return name.slice(0, 63)
}

function buildDatabaseUrl(adminDatabaseUrl: string, databaseName: string) {
  const url = new URL(adminDatabaseUrl)

  url.pathname = `/${databaseName}`

  return url.toString()
}

function sanitizeIdentifier(value: string) {
  const sanitized = value
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')

  if (!sanitized || !/^[a-z_]/.test(sanitized)) {
    return `db_${sanitized || 'test'}`
  }

  return sanitized
}

function quoteIdentifier(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : JSON.stringify(error)
}

function describeDatabaseUrl(databaseUrl: string) {
  const url = new URL(databaseUrl)

  return `${url.protocol}//${url.hostname}:${url.port || '5432'}${url.pathname}`
}
