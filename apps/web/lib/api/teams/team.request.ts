import {
  CreateTeamRequestSchema,
  TeamDetailResponseSchema,
  TeamListResponseSchema,
  type CreateTeamInput,
  type TeamListQuery,
} from '@repo/contracts'
import { apiRequest } from '../http'
import { teamEndpoints, teamListEndpoint } from './team.endpoint'

export function listTeams(query: Partial<TeamListQuery> = {}) {
  return apiRequest(teamListEndpoint(query), TeamListResponseSchema, {
    cache: 'no-store',
  })
}

export function getTeam(teamId: string) {
  return apiRequest(teamEndpoints.detail(teamId), TeamDetailResponseSchema, {
    cache: 'no-store',
  })
}

export function createTeam(payload: CreateTeamInput, accessToken: string) {
  const body = CreateTeamRequestSchema.parse(payload)

  return apiRequest(teamEndpoints.create, TeamDetailResponseSchema, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body,
    cache: 'no-store',
  })
}
