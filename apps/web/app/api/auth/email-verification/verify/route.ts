import { VerifyEmailResponseSchema, VerifyEmailSchema } from '@repo/contracts/auth'
import { verifyEmail } from '~/lib/api/auth/auth.request'
import { withRouteHandler } from '~/lib/api/with-route-handler'

export const POST = withRouteHandler(async (request) => {
  const payload = VerifyEmailSchema.parse(await request.json())
  const result = await verifyEmail(payload.token)

  return Response.json(VerifyEmailResponseSchema.parse(result))
})
