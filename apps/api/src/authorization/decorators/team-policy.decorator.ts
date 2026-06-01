import { SetMetadata } from '@nestjs/common'
import { Action } from '@repo/authorization'

export const TEAM_POLICY_KEY = 'team_policy'
export const TEAM_MEMBERSHIP_POLICY_KEY = 'team_membership_policy'

export type TeamPolicyMetadata = {
  action: Action
  teamIdParam: string
}

export type TeamMembershipPolicyMetadata = {
  teamIdParam: string
}

type TeamPolicyOptions = {
  teamIdParam?: string
}

export const RequireTeamPolicy = (
  action: Action = Action.Update,
  options: TeamPolicyOptions = {},
) =>
  SetMetadata(TEAM_POLICY_KEY, {
    action,
    teamIdParam: options.teamIdParam ?? 'id',
  } satisfies TeamPolicyMetadata)

export const RequireTeamManagement = (options: TeamPolicyOptions = {}) =>
  RequireTeamPolicy(Action.Update, options)

export const RequireTeamMembership = (options: TeamPolicyOptions = {}) =>
  SetMetadata(TEAM_MEMBERSHIP_POLICY_KEY, {
    teamIdParam: options.teamIdParam ?? 'id',
  } satisfies TeamMembershipPolicyMetadata)
