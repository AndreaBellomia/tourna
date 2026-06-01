import { NextResponse } from 'next/server'
import { refresh } from '../../../../lib/api/auth/auth.request'
import { withRouteHandler } from '../../../../lib/api/with-route-handler'
import { authCookieNames } from '../../../../lib/auth/cookies'
import { clearAuthCookies, createAuthResponse } from '../../../../lib/auth/session'
import { unauthorized } from '../../../../lib/api/responses'

export const POST = withRouteHandler(async (request) => {
  const refreshToken = request.cookies.get(authCookieNames.refreshToken)?.value

  if (!refreshToken) {
    console.warn('[auth] refresh requested without refresh token')
    throw unauthorized('Authentication required')
  }

  try {
    const auth = await refresh(refreshToken)
    console.info('[auth] session refreshed explicitly')

    return createAuthResponse(auth)
  } catch (error) {
    console.warn('[auth] explicit refresh failed')
    void error

    const response = NextResponse.json(
      {
        message: 'Session expired',
        code: 'SESSION_EXPIRED',
      },
      { status: 401 },
    )
    clearAuthCookies(response)

    return response
  }
})
