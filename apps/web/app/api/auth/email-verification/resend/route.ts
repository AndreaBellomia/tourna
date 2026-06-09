import { z } from 'zod'
import { NextResponse } from 'next/server'
import { authenticatedApiRequest } from '~/lib/api/auth/authenticated-request'
import { authEndpoints } from '~/lib/api/auth/auth.endpoint'
import { withRouteHandler } from '~/lib/api/with-route-handler'
import { setAuthCookies } from '~/lib/auth/session'

export const POST = withRouteHandler(async (request) => {
  const result = await authenticatedApiRequest(
    request,
    authEndpoints.resendEmailVerification,
    z.void(),
    {
      method: 'POST',
      cache: 'no-store',
      body: {},
    },
  )

  const response = new NextResponse(null, { status: 204 })

  if (result.auth) {
    setAuthCookies(response, result.auth)
  }

  return response
})
