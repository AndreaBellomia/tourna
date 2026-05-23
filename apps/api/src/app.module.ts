import { ZodValidationPipe, ZodSerializerInterceptor, ZodSerializationException } from 'nestjs-zod'
import { APP_PIPE, APP_INTERCEPTOR, APP_FILTER, BaseExceptionFilter } from '@nestjs/core'
import { ZodError } from 'zod'
import { Module, HttpException, ArgumentsHost, Logger, Catch } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AppConfigModule } from './config/config.module'
import { DatabaseModule } from './database/database.module'
import { RedisClientModule } from './redis/redis.module'
import { AuthModule } from './auth/auth.module'
import { CacheModule } from './cache/cache.module'
import { AuthorizationModule } from './authorization/authorization.module'

@Catch(HttpException)
class HttpExceptionFilter extends BaseExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name)

  catch(exception: HttpException, host: ArgumentsHost) {
    if (exception instanceof ZodSerializationException) {
      const zodError = exception.getZodError()

      if (zodError instanceof ZodError) {
        this.logger.error(`ZodSerializationException: ${zodError.message}`)
      }
    }

    super.catch(exception, host)
  }
}

@Module({
  imports: [
    DatabaseModule,
    AppConfigModule,
    RedisClientModule,
    AuthModule,
    CacheModule,
    AuthorizationModule,
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
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
