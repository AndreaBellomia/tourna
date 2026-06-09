import { NextRequest, NextResponse } from 'next/server'
import { defaultLocale, locales } from '~/lib/i18n/config'

const LOCALE_EXCLUDED_PREFIXES = ['/_next', '/api', '/_vercel']
const PUBLIC_FILE_PATHNAME = /\.[^/]+$/

export function shouldExcludeFromLocaleRedirect(pathname: string) {
  return (
    LOCALE_EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    PUBLIC_FILE_PATHNAME.test(pathname)
  )
}

export function hasLocalePrefix(pathname: string) {
  return locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))
}

export function createLocaleRedirectResponse(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (shouldExcludeFromLocaleRedirect(pathname) || hasLocalePrefix(pathname)) {
    return null
  }

  const url = request.nextUrl.clone()
  url.pathname = pathname === '/' ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`

  console.log(`Redirecting to locale-specific URL: ${url.pathname}`)

  return NextResponse.redirect(url)
}
