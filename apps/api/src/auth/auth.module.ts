import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { APP_GUARD } from '@nestjs/core'
import { AuthController } from './auth.controller'
import { SessionService } from './services/session.service'
import { TokenService } from '~/tokens/token.service'
import { AccessTokenGuard } from './guards/access-token.guard'
import { AppConfigService } from '~/config/config.service'
import { AuthService } from './services/auth.service'
import { QueueModule } from '~/queue/queue.module'

@Module({
  imports: [
    QueueModule,
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_ACCESS_EXPIRES_IN') },
      }),
    }),
  ],
  providers: [
    AuthService,
    SessionService,
    TokenService,
    { provide: APP_GUARD, useClass: AccessTokenGuard },
  ],
  controllers: [AuthController],
  exports: [JwtModule, TokenService, SessionService],
})
export class AuthModule {}
