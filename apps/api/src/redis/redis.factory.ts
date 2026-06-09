import { createRedisClient, type RedisClient } from '@repo/redis'
import { REDIS_CLIENT } from './redis.tokens'
import { AppConfigService } from '~/config/config.service'

export const redisProvider = {
  provide: REDIS_CLIENT,
  inject: [AppConfigService],
  useFactory: async (config: AppConfigService): Promise<RedisClient> => {
    const client = createRedisClient({
      host: config.get('REDIS_HOST'),
      port: config.get('REDIS_PORT'),
      password: config.get('REDIS_PASSWORD'),
      db: config.get('REDIS_DB'),
    })
    await client.connect()
    return client
  },
}
