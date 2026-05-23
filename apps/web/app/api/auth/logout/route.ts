import { NextResponse } from "next/server"
import { authCookieNames, authCookieOptions } from "../../../../lib/auth/cookies"

export async function POST() {
  const response = new NextResponse(null, { status: 204 })

  response.cookies.set(authCookieNames.accessToken, "", {
    ...authCookieOptions,
    maxAge: 0,
  })
  response.cookies.set(authCookieNames.refreshToken, "", {
    ...authCookieOptions,
    maxAge: 0,
  })
  response.cookies.set(authCookieNames.sessionId, "", {
    ...authCookieOptions,
    maxAge: 0,
  })

  return response
}
