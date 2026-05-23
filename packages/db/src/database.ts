import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { DatabaseSchema } from './schema'

export type CreateConnectionsOptions = {
  max?: number
} & (
  | {
      connectionString: string
    }
  | {
      host: string
      port: number
      database: string
      user: string
      password: string
    }
)
export function createConnections(options: CreateConnectionsOptions) {
  const pool = new Pool({
    ...('connectionString' in options
      ? {
          connectionString: options.connectionString,
        }
      : {
          host: options.host,
          port: options.port,
          database: options.database,
          user: options.user,
          password:
            typeof options.password === 'string'
              ? options.password
              : String(options.password ?? ''),
        }),
    max: options.max ?? 10,
  })

  const db = new Kysely<DatabaseSchema>({
    dialect: new PostgresDialect({ pool }),
  })

  return {
    db,
    pool,
    destroy: async () => {
      await pool.end()
    },
  }
}

export type KyselyDatabase = Kysely<DatabaseSchema>
export type KyselyConnections = ReturnType<typeof createConnections>
