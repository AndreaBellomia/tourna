import { ProfileSummaryResponseSchema, UpdateProfileRequestSchema } from '@repo/contracts'
import { authenticatedApiRequest, jsonWithAuth } from '~/lib/api/auth/authenticated-request'
import { profileEndpoints } from '~/lib/api/profile/profile.endpoint'
import { withRouteHandler } from '~/lib/api/with-route-handler'

export const GET = withRouteHandler(async (request) => {
  const result = await authenticatedApiRequest(
    request,
    profileEndpoints.getProfile,
    ProfileSummaryResponseSchema,
    {
      cache: 'no-store',
    },
  )

  return jsonWithAuth(result)
})

export const PATCH = withRouteHandler(async (request) => {
  const payload = UpdateProfileRequestSchema.parse(await request.json())
  const result = await authenticatedApiRequest(
    request,
    profileEndpoints.updateProfile,
    ProfileSummaryResponseSchema,
    {
      method: 'PATCH',
      body: payload,
      cache: 'no-store',
    },
  )

  return jsonWithAuth(result)
})
