export const CacheKeys = {
  memberships: (userId: string) => ['auth', 'memberships', userId],
  teamAuthorizationTarget: (teamId: string) => ['auth', 'teams', teamId, 'target'],
  teamMembership: (userId: string, teamId: string) => [
    'auth',
    'team-memberships',
    userId,
    teamId,
  ],
}
