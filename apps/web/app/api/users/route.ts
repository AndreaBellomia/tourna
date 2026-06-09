import { UserListQuerySchema } from '@repo/contracts'
import { readLocaleFromHeaders } from '~/lib/api/locale-header'
import { ok } from '~/lib/api/responses'
import { listUsers } from '~/lib/api/users/user.request'
import { withRouteHandler } from '~/lib/api/with-route-handler'

export const GET = withRouteHandler(async (request) => {
  const query = UserListQuerySchema.parse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )
  const users = await listUsers(query, readLocaleFromHeaders(request.headers))

  return ok(users)
})
