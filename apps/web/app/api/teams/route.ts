import { CreateTeamRequestSchema, TeamListQuerySchema } from '@repo/contracts'
import { created, ok, unauthorized } from '../../../lib/api/responses'
import { createTeam, listTeams } from '../../../lib/api/teams/team.request'
import { withRouteHandler } from '../../../lib/api/with-route-handler'
import { authCookieNames } from '../../../lib/auth/cookies'

export const GET = withRouteHandler(async (request) => {
  const query = TeamListQuerySchema.parse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )

  const teams = await listTeams(query)

  return ok(teams)
})

export const POST = withRouteHandler(async (request) => {
  const accessToken = request.cookies.get(authCookieNames.accessToken)?.value

  if (!accessToken) {
    throw unauthorized('Authentication required')
  }

  const payload = CreateTeamRequestSchema.parse(await request.json())
  const team = await createTeam(payload, accessToken)

  return created(team)
})
