import { SignupSchema } from '@repo/contracts/auth'
import { signup } from '~/lib/api/auth/auth.request'
import { withRouteHandler } from '~/lib/api/with-route-handler'
import {
  createAuthErrorResponse,
  createAuthResponse,
  readRequestLocale,
} from '~/app/api/auth/_shared'

export const POST = withRouteHandler(
  async (request) => {
    const payload = SignupSchema.parse(await request.json())
    const auth = await signup(payload)

    return createAuthResponse(auth)
  },
  {
    onError: (error, request) => createAuthErrorResponse(error, readRequestLocale(request)),
  },
)
