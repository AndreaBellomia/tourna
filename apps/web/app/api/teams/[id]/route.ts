import { TeamDetailResponseSchema, UpdateTeamRequestSchema } from '@repo/contracts'
import {
  authenticatedApiRequest,
  jsonWithAuth,
  optionalAuthenticatedApiRequest,
} from '~/lib/api/auth/authenticated-request'
import { badRequest } from '~/lib/api/responses'
import { teamEndpoints } from '~/lib/api/teams/team.endpoint'
import { withRouteHandler } from '~/lib/api/with-route-handler'

type TeamRouteContext = {
  params: Promise<Record<string, string>>
}

export const PATCH = withRouteHandler<TeamRouteContext>(async (request, context) => {
  const { id } = await context.params

  if (!id) {
    throw badRequest('Missing team id')
  }

  const payload = UpdateTeamRequestSchema.parse(await request.json())
  const result = await authenticatedApiRequest(
    request,
    teamEndpoints.detail(id),
    TeamDetailResponseSchema,
    {
      method: 'PATCH',
      body: payload,
      cache: 'no-store',
    },
  )

  return jsonWithAuth(result)
})
