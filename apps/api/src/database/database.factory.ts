import { createConnections } from '@repo/db'
import { DB_CONNECTION } from './database.token'
import { AppConfigService } from '../config/config.service'

export const databaseProvider = {
  provide: DB_CONNECTION,
  inject: [AppConfigService],
  useFactory: (config: AppConfigService) => {
    const databaseUrl = config.get('DATABASE_URL')

    const { db, destroy } = databaseUrl
      ? createConnections({
          connectionString: databaseUrl,
          max: config.get('DATABASE_MAX'),
        })
      : createConnections({
          host: config.get('DATABASE_HOST'),
          port: config.get('DATABASE_PORT'),
          database: config.get('DATABASE_NAME'),
          user: config.get('DATABASE_USER'),
          password: config.get('DATABASE_PASSWORD'),
          max: config.get('DATABASE_MAX'),
        })

    return { db, destroy }
  },
}
