import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod'
import { APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core'
import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AppConfigModule } from './config/config.module'
import { DatabaseModule } from './database/database.module'
import { RedisClientModule } from './redis/redis.module'
import { AuthModule } from './auth/auth.module'
import { CacheModule } from './cache/cache.module'
import { AuthorizationModule } from './authorization/authorization.module'
import { TasksModule } from './tasks/tasks.module'
import { StorageModule } from './storage/storage.module'
import { ApiCacheInterceptor } from './cache/api-cache.interceptor'
import { TeamModule } from './team/team.module'
import { ErrorModule } from './error/error.module'
import { ProfileModule } from './profile/profile.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [
    DatabaseModule,
    AppConfigModule,
    RedisClientModule,
    AuthModule,
    CacheModule,
    AuthorizationModule,
    TasksModule,
    StorageModule,
    TeamModule,
    ErrorModule,
    ProfileModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiCacheInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule {}
