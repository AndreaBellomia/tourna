import { z } from 'zod'
import { authenticatedApiRequest, jsonWithAuth } from '~/lib/api/auth/authenticated-request'
import { badRequest } from '~/lib/api/responses'
import { teamEndpoints } from '~/lib/api/teams/team.endpoint'
import { withRouteHandler } from '~/lib/api/with-route-handler'

type TeamInvitationRevokeRouteContext = {
  params: Promise<Record<string, string>>
}

export const POST = withRouteHandler<TeamInvitationRevokeRouteContext>(async (request, context) => {
  const { id, invitationId } = await context.params

  if (!id) {
    throw badRequest('Missing team id')
  }

  if (!invitationId) {
    throw badRequest('Missing invitation id')
  }

  const result = await authenticatedApiRequest(
    request,
    teamEndpoints.revokeInvitation(id, invitationId),
    z.void(),
    {
      method: 'POST',
      cache: 'no-store',
    },
  )

  return jsonWithAuth({ data: null, auth: result.auth })
})
