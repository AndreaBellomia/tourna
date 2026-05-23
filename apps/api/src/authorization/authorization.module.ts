import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { AuthorizationService } from './authorization.service'
import { PoliciesGuard } from './guards/policies.guard'
import { CacheModule } from '../cache/cache.module'

@Module({
  imports: [CacheModule],
  providers: [
    AuthorizationService,
    {
      provide: APP_GUARD,
      useClass: PoliciesGuard,
    },
  ],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
