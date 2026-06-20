import { TeamInvitationRequestSchema, TeamInvitationCreateResponseSchema } from '@repo/contracts'
import { authenticatedApiRequest, jsonWithAuth } from '~/lib/api/auth/authenticated-request'
import { badRequest } from '~/lib/api/responses'
import { teamEndpoints } from '~/lib/api/teams/team.endpoint'
import { withRouteHandler } from '~/lib/api/with-route-handler'

type TeamInvitationRouteContext = {
  params: Promise<Record<string, string>>
}

export const POST = withRouteHandler<TeamInvitationRouteContext>(async (request, context) => {
  const { id } = await context.params

  if (!id) {
    throw badRequest('Missing team id')
  }

  const payload = TeamInvitationRequestSchema.parse(await request.json())
  const result = await authenticatedApiRequest(
    request,
    teamEndpoints.invitations(id),
    TeamInvitationCreateResponseSchema,
    {
      method: 'POST',
      body: payload,
      cache: 'no-store',
    },
  )

  return jsonWithAuth(result)
})
