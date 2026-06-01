import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { JwtPayload } from '@repo/domain'
import { AuthorizationService } from '../authorization.service'
import {
  TEAM_MEMBERSHIP_POLICY_KEY,
  TEAM_POLICY_KEY,
  type TeamMembershipPolicyMetadata,
  type TeamPolicyMetadata,
} from '../decorators/team-policy.decorator'

type RequestWithTeamPolicyContext = {
  params?: Record<string, string | undefined>
  user?: JwtPayload
}

@Injectable()
export class TeamPoliciesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authz: AuthorizationService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const teamPolicy = this.reflector.getAllAndOverride<TeamPolicyMetadata>(TEAM_POLICY_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])
    const membershipPolicy = this.reflector.getAllAndOverride<TeamMembershipPolicyMetadata>(
      TEAM_MEMBERSHIP_POLICY_KEY,
      [ctx.getHandler(), ctx.getClass()],
    )

    if (!teamPolicy && !membershipPolicy) return true

    const req = ctx.switchToHttp().getRequest<RequestWithTeamPolicyContext>()
    const user = req.user
    if (!user) return false

    const teamId = this.resolveTeamId(req, teamPolicy?.teamIdParam ?? membershipPolicy?.teamIdParam)

    if (teamPolicy) {
      return await this.authz.canAccessTeamAction(user.userId, teamId, teamPolicy.action)
    }

    return await this.authz.hasActiveTeamMembership(user.userId, teamId)
  }

  private resolveTeamId(req: RequestWithTeamPolicyContext, teamIdParam: string | undefined) {
    if (!teamIdParam) throw new BadRequestException('Missing team policy route param metadata')

    const teamId = req.params?.[teamIdParam]
    if (!teamId) throw new BadRequestException(`Missing team route param "${teamIdParam}"`)

    return teamId
  }
}
