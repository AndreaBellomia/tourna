import { ok } from '../../../../lib/api/responses'
import { getTeam } from '../../../../lib/api/teams/team.request'
import { withRouteHandler } from '../../../../lib/api/with-route-handler'

type TeamRouteContext = {
  params: Promise<{ teamId: string }>
}

export const GET = withRouteHandler<TeamRouteContext>(async (_request, { params }) => {
  const { teamId } = await params
  const team = await getTeam(teamId)

  return ok(team)
})
