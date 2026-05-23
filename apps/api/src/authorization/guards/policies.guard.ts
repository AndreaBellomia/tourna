import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthorizationService } from '../authorization.service'
import { CHECK_POLICY } from '../decorators/check-policy.decorator'
import { JwtPayload } from '@repo/domain'
import { Action, Subject } from '@repo/authorization'

type PolicyRule = {
  action: Action
  subject: Subject
}

type RequestWithUser = {
  user?: JwtPayload
}

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authz: AuthorizationService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const rule = this.reflector.get<PolicyRule>(CHECK_POLICY, ctx.getHandler())

    if (!rule) return true

    const req = ctx.switchToHttp().getRequest<RequestWithUser>()
    const user = req.user
    if (!user) return false

    return this.authz.check(user.userId, rule.action, rule.subject)
  }
}
