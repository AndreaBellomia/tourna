import {
  CreateTeamRequestSchema,
  TeamDetailResponseSchema,
  TeamListResponseSchema,
  type CreateTeamInput,
  type TeamListQuery,
} from '@repo/contracts'
import { apiRequest } from '../http'
import type { Locale } from '../../i18n/config'
import { teamEndpoints, teamListEndpoint } from './team.endpoint'

export function listTeams(query: Partial<TeamListQuery> = {}, locale?: Locale) {
  return apiRequest(teamListEndpoint(query), TeamListResponseSchema, {
    cache: 'no-store',
    locale,
  })
}

export function getTeam(teamId: string, locale?: Locale) {
  return apiRequest(teamEndpoints.detail(teamId), TeamDetailResponseSchema, {
    cache: 'no-store',
    locale,
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
