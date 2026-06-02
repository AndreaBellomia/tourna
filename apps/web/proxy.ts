import { NextResponse, type NextRequest } from 'next/server'
import { createLocaleRedirectResponse } from './middlewares/locale.middleware'

export function proxy(request: NextRequest) {
  const localeRedirectResponse = createLocaleRedirectResponse(request)

  if (localeRedirectResponse) {
    return localeRedirectResponse
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/:path*'],
}
