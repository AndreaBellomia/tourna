import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ApiError } from '../../../lib/api/errors/api-error'
export { createAuthResponse } from '../../../lib/auth/session'
import { defaultLocale, isLocale, type Locale } from '../../../lib/i18n/config'
import { getMessages } from '../../../lib/i18n/web-i18n'

export type ClientAuthResponse = {
  sessionId: string
}

export function readRequestLocale(request: Request): Locale {
  const headerLocale = request.headers.get('x-tourna-locale')

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
