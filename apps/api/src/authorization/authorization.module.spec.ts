import { APP_GUARD } from '@nestjs/core'
import { MODULE_METADATA } from '@nestjs/common/constants'
import { AuthorizationModule } from './authorization.module'
import { AuthorizationService } from './authorization.service'
import { PoliciesGuard } from './guards/policies.guard'
import { TeamPoliciesGuard } from './guards/team-policies.guard'

describe('AuthorizationModule', () => {
  it('registers authorization service and policies guard as app guard', () => {
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      AuthorizationModule,
    ) as unknown[]
    const exportedProviders = Reflect.getMetadata(
      MODULE_METADATA.EXPORTS,
      AuthorizationModule,
    ) as unknown[]

    expect(providers).toContain(AuthorizationService)
    expect(providers).toContainEqual({
      provide: APP_GUARD,
      useClass: PoliciesGuard,
    })
    expect(providers).toContainEqual({
      provide: APP_GUARD,
      useClass: TeamPoliciesGuard,
    })
    expect(exportedProviders).toContain(AuthorizationService)
  })
})
