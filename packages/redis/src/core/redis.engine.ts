import { RedisClient } from '../client/redis.client'
import { RedisHashEngine } from '../engine/hash.engine'
import { RedisKVEngine } from '../engine/kv.engine'
import { RedisListEngine } from '../engine/list.engine'
import { RedisSetEngine } from '../engine/set.engine'
import { RedisZSetEngine } from '../engine/zset.engine'
import { RedisPipeline } from '../pipeline/redis.pipeline'

export class RedisEngine {
  readonly kv: RedisKVEngine
  readonly hash: RedisHashEngine
  readonly list: RedisListEngine
  readonly set: RedisSetEngine
  readonly zset: RedisZSetEngine

  constructor(private readonly client: RedisClient) {
    this.kv = new RedisKVEngine(client)
    this.hash = new RedisHashEngine(client)
    this.list = new RedisListEngine(client)
    this.set = new RedisSetEngine(client)
    this.zset = new RedisZSetEngine(client)
  }

  pipeline(): RedisPipeline {
    return new RedisPipeline(this.client.pipeline())
  }

  multi(): RedisPipeline {
    return new RedisPipeline(this.client.multi())
  }

  async ping() {
    return this.client.ping()
  }
}

export function createRedisEngine(client: RedisClient): RedisEngine {
  return new RedisEngine(client)
}
