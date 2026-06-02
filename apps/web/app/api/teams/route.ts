import { authenticatedApiRequest, jsonWithAuth } from '../../../lib/api/auth/authenticated-request'
import { readLocaleFromHeaders } from '../../../lib/api/locale-header'
import { teamEndpoints } from '../../../lib/api/teams/team.endpoint'
import { ok } from '../../../lib/api/responses'
import { listTeams } from '../../../lib/api/teams/team.request'
import { withRouteHandler } from '../../../lib/api/with-route-handler'
import {
  CreateTeamRequestSchema,
  TeamDetailResponseSchema,
  TeamListQuerySchema,
} from '@repo/contracts'

export const GET = withRouteHandler(async (request) => {
  const query = TeamListQuerySchema.parse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )

  const teams = await listTeams(query, readLocaleFromHeaders(request.headers))

  return ok(teams)
})

export const POST = withRouteHandler(async (request) => {
  const payload = CreateTeamRequestSchema.parse(await request.json())
  const result = await authenticatedApiRequest(
    request,
    teamEndpoints.create,
    TeamDetailResponseSchema,
    {
      method: 'POST',
      body: payload,
      cache: 'no-store',
    },
  )

  return jsonWithAuth(result, { status: 201 })
})
