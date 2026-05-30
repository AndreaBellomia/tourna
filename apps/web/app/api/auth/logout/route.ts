import { NextRequest, NextResponse } from 'next/server'
import { authCookieNames, authCookieOptions } from '../../../../lib/auth/cookies'
import { logout as revokeSession } from '../../../../lib/api/auth'

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(authCookieNames.accessToken)?.value

  if (accessToken) {
    try {
      await revokeSession(accessToken)
    } catch {
      // Best-effort: clear cookies even if backend revocation fails
    }
  }

  const response = new NextResponse(null, { status: 204 })

  response.cookies.set(authCookieNames.accessToken, '', {
    ...authCookieOptions,
    maxAge: 0,
  })
  response.cookies.set(authCookieNames.refreshToken, '', {
    ...authCookieOptions,
    maxAge: 0,
  })
  response.cookies.set(authCookieNames.sessionId, '', {
    ...authCookieOptions,
    maxAge: 0,
  })

  return response
}
