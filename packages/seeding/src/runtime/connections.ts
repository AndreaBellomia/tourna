import { createConnections, type KyselyConnections } from '@repo/db'
import { createRedisClient, type RedisClient } from '@repo/redis'
import { loadSeedEnvironmentConfig, type SeedEnvironmentConfig } from '../config'

export interface SeedRuntimeConnections {
  db: KyselyConnections['db']
  redis?: RedisClient
  destroy(): Promise<void>
}

export function createSeedRuntimeConnections(
  config: SeedEnvironmentConfig = loadSeedEnvironmentConfig(),
): SeedRuntimeConnections {
  const dbConnections = createConnections(config.database)
  const redis = config.redis ? createRedisClient(config.redis) : undefined

  return {
    db: dbConnections.db,
    redis,
    destroy: async () => {
      await redis?.quit()
      await dbConnections.destroy()
    },
  }
}
