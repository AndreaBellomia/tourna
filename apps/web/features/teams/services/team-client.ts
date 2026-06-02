'use client'

import {
  CreateTeamRequestSchema,
  TeamDetailResponseSchema,
  TeamListResponseSchema,
  UpdateTeamRequestSchema,
  type CreateTeamInput,
  type TeamListQuery,
  type UpdateTeamInput,
} from '@repo/contracts'
import { clientApiRequest } from '../../common/services/client-api'

export type ClientTeamListQuery = Partial<TeamListQuery>

export function fetchTeams(query: ClientTeamListQuery = {}) {
  return clientApiRequest({
    path: '/api/teams',
    schema: TeamListResponseSchema,
    query,
    fallbackErrorMessage: 'Unable to load teams',
  })
}

export function submitTeam(values: CreateTeamInput) {
  const payload = CreateTeamRequestSchema.parse(values)

  return clientApiRequest({
    path: '/api/teams',
    schema: TeamDetailResponseSchema,
    method: 'POST',
    body: payload,
    fallbackErrorMessage: 'Unable to create team',
  })
}

export function fetchTeam(teamId: string) {
  return clientApiRequest({
    path: `/api/teams/${teamId}`,
    schema: TeamDetailResponseSchema,
    fallbackErrorMessage: 'Unable to load team',
  })
}

export function updateTeam(teamId: string, values: UpdateTeamInput) {
  const payload = UpdateTeamRequestSchema.parse(values)

  return clientApiRequest({
    path: `/api/teams/${teamId}`,
    schema: TeamDetailResponseSchema,
    method: 'PATCH',
    body: payload,
    fallbackErrorMessage: 'Unable to update team',
  })
}
