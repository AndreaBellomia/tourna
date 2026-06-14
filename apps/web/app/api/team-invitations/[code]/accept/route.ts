import { TeamInvitationAcceptResponseSchema, TeamInvitationCodeParamSchema } from '@repo/contracts'
import { authenticatedApiRequest, jsonWithAuth } from '~/lib/api/auth/authenticated-request'
import { teamEndpoints } from '~/lib/api/teams/team.endpoint'
import { withRouteHandler } from '~/lib/api/with-route-handler'

type TeamInvitationAcceptRouteContext = {
  params: Promise<Record<string, string>>
}

export const POST = withRouteHandler<TeamInvitationAcceptRouteContext>(async (request, context) => {
  const params = TeamInvitationCodeParamSchema.parse(await context.params)
  const result = await authenticatedApiRequest(
    request,
    teamEndpoints.acceptInvitation(params.code),
    TeamInvitationAcceptResponseSchema,
    {
      method: 'POST',
      cache: 'no-store',
    },
  )

  return jsonWithAuth(result)
})
