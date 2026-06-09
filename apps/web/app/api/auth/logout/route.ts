import { logout as revokeSession } from '~/lib/api/auth/auth.request'
import { noContent } from '~/lib/api/responses'
import { withRouteHandler } from '~/lib/api/with-route-handler'
import { authCookieNames } from '~/lib/auth/cookies'
import { clearAuthCookies } from '~/lib/auth/session'

export const POST = withRouteHandler(async (request) => {
  const accessToken = request.cookies.get(authCookieNames.accessToken)?.value

  if (accessToken) {
    try {
      await revokeSession(accessToken)
    } catch {
      // Best-effort: clear cookies even if backend revocation fails
    }
  }

  const response = noContent()
  clearAuthCookies(response)

  return response
})
