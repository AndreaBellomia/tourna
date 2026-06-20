import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse, type NextRequest } from 'next/server'
import type { AuthResponse } from '@repo/contracts/auth'
import {
  accessTokenMaxAge,
  authCookieNames,
  authCookieOptions,
  refreshTokenMaxAge,
} from './cookies'
import { type Locale, withLocale } from '~/lib/i18n/config'

export type RequestAuthTokens = {
  accessToken?: string
  refreshToken?: string
}

export async function requireAuthenticatedPage(locale: Locale): Promise<void> {
  const cookieStore = await cookies()

  if (!cookieStore.has(authCookieNames.refreshToken)) {
    redirect(withLocale(locale, '/login'))
  }
}

export function readRequestAuthTokens(request: NextRequest): RequestAuthTokens {
  return {
    accessToken: request.cookies.get(authCookieNames.accessToken)?.value,
    refreshToken: request.cookies.get(authCookieNames.refreshToken)?.value,
  }
}

export function createAuthResponse(auth: AuthResponse) {
  const response = NextResponse.json({
    sessionId: auth.sessionId,
  })

  setAuthCookies(response, auth)

  return response
}

export function setAuthCookies(response: NextResponse, auth: AuthResponse): void {
  response.cookies.set(authCookieNames.accessToken, auth.accessToken, {
    ...authCookieOptions,
    maxAge: accessTokenMaxAge,
  })
  response.cookies.set(authCookieNames.refreshToken, auth.refreshToken, {
    ...authCookieOptions,
    maxAge: refreshTokenMaxAge,
  })
  response.cookies.set(authCookieNames.sessionId, auth.sessionId, {
    ...authCookieOptions,
    maxAge: refreshTokenMaxAge,
  })
}

export async function setAuthCookiesInStore(auth: AuthResponse): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set(authCookieNames.accessToken, auth.accessToken, {
    ...authCookieOptions,
    maxAge: accessTokenMaxAge,
  })
  cookieStore.set(authCookieNames.refreshToken, auth.refreshToken, {
    ...authCookieOptions,
    maxAge: refreshTokenMaxAge,
  })
  cookieStore.set(authCookieNames.sessionId, auth.sessionId, {
    ...authCookieOptions,
    maxAge: refreshTokenMaxAge,
  })
}

export function clearAuthCookies(response: NextResponse): void {
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
}
