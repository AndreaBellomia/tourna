import {
  CursorPaginationQuerySchema,
  TeamInvitationRequestSchema,
  TeamInvitationCreateResponseSchema,
  TeamInvitationListResponseSchema,
} from '@repo/contracts'
import { authenticatedApiRequest, jsonWithAuth } from '~/lib/api/auth/authenticated-request'
import { badRequest } from '~/lib/api/responses'
import { teamEndpoints } from '~/lib/api/teams/team.endpoint'
import { withRouteHandler } from '~/lib/api/with-route-handler'

type TeamInvitationRouteContext = {
  params: Promise<Record<string, string>>
}

export const GET = withRouteHandler<TeamInvitationRouteContext>(async (request, context) => {
  const { id } = await context.params

  if (!id) {
    throw badRequest('Missing team id')
  }

  const query = CursorPaginationQuerySchema.parse({
    limit: request.nextUrl.searchParams.get('limit') ?? undefined,
    cursor: request.nextUrl.searchParams.get('cursor') ?? undefined,
    direction: request.nextUrl.searchParams.get('direction') ?? undefined,
  })
  const result = await authenticatedApiRequest(
    request,
    withQuery(teamEndpoints.invitations(id), query),
    TeamInvitationListResponseSchema,
    {
      cache: 'no-store',
    },
  )

  return jsonWithAuth(result)
})

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

function withQuery(
  path: string,
  query: {
    limit: number
    cursor?: string
    direction: 'next' | 'prev'
  },
) {
  const search = new URLSearchParams({
    limit: String(query.limit),
    direction: query.direction,
  })

  if (query.cursor) {
    search.set('cursor', query.cursor)
  }

  return `${path}?${search.toString()}`
}
