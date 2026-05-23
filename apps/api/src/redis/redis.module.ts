import { Global, Module } from '@nestjs/common'
import { RedisService } from './redis.service'
import { redisProvider } from './redis.factory'

@Global()
@Module({
  providers: [redisProvider, RedisService],
  exports: [RedisService],
})
export class RedisClientModule {}
