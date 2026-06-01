import { LoginSchema } from '@repo/contracts/auth'
import { login } from '../../../../lib/api/auth/auth.request'
import { withRouteHandler } from '../../../../lib/api/with-route-handler'
import { createAuthErrorResponse, createAuthResponse, readRequestLocale } from '../_shared'

export const POST = withRouteHandler(
  async (request) => {
    const payload = LoginSchema.parse(await request.json())
    const auth = await login(payload)

    return createAuthResponse(auth)
  },
  {
    onError: (error, request) => createAuthErrorResponse(error, readRequestLocale(request)),
  },
)
