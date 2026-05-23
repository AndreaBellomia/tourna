import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common'
import { createRedisEngine, RedisEngine, type RedisClient } from '@repo/redis'
import { REDIS_CLIENT } from './redis.tokens'

@Injectable()
export class RedisService implements OnModuleDestroy {
  public readonly engine: RedisEngine

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly client: RedisClient,
  ) {
    this.engine = createRedisEngine(client)
  }

  getClient(): RedisClient {
    return this.client
  }

  async onModuleDestroy() {
    await this.client.quit()
  }
}
