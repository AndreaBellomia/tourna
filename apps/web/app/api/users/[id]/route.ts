import { UserDetailResponseSchema } from '@repo/contracts'
import {
  optionalAuthenticatedApiRequest,
  jsonWithAuth,
} from '../../../../lib/api/auth/authenticated-request'
import { badRequest } from '../../../../lib/api/responses'
import { userEndpoints } from '../../../../lib/api/users/user.endpoint'
import { withRouteHandler } from '../../../../lib/api/with-route-handler'

type UserRouteContext = {
  params: Promise<Record<string, string>>
}

export const GET = withRouteHandler<UserRouteContext>(async (request, context) => {
  const { id } = await context.params

  if (!id) {
    throw badRequest('Missing user id')
  }

  const result = await optionalAuthenticatedApiRequest(
    request,
    userEndpoints.detail(id),
    UserDetailResponseSchema,
    {
      cache: 'no-store',
    },
  )

  return jsonWithAuth(result)
})
