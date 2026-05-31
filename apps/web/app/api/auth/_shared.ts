import { NextResponse } from "next/server"
import { z } from "zod"
import { type AuthResponse } from "@repo/contracts/auth"
import {
  accessTokenMaxAge,
  authCookieNames,
  authCookieOptions,
  refreshTokenMaxAge,
} from "../../../lib/auth/cookies"
import { ApiError } from "../../../lib/api/http"
import { defaultLocale, isLocale, type Locale } from "../../../lib/i18n/config"
import { getMessages } from "../../../lib/i18n/web-i18n"

export type ClientAuthResponse = {
  sessionId: string
}

export function createAuthResponse(auth: AuthResponse) {
  const response = NextResponse.json<ClientAuthResponse>({
    sessionId: auth.sessionId,
  })

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

  return response
}

export function readRequestLocale(request: Request): Locale {
  const headerLocale = request.headers.get("x-tourna-locale")

  return headerLocale && isLocale(headerLocale) ? headerLocale : defaultLocale
}

export function createAuthErrorResponse(error: unknown, locale: Locale) {
  const messages = getMessages(locale).auth.errors

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { message: messages.invalidData, issues: z.flattenError(error).fieldErrors },
      { status: 422 },
    )
  }

  if (error instanceof ApiError) {
    const message = error.status === 401 ? messages.invalidCredentials : error.message

    return NextResponse.json({ message }, { status: error.status })
  }

  return NextResponse.json({ message: messages.requestFailed }, { status: 502 })
}
