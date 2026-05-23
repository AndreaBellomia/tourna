import { NextResponse, type NextRequest } from "next/server"
import { authCookieNames } from "./lib/auth/cookies"
import { defaultLocale, isLocale, withLocale } from "./lib/i18n/config"

export function proxy(request: NextRequest) {
  const hasAccessToken = request.cookies.has(authCookieNames.accessToken)
  const [, maybeLocale, section] = request.nextUrl.pathname.split("/")
  const locale = maybeLocale && isLocale(maybeLocale) ? maybeLocale : defaultLocale

  if (section === "dashboard" && !hasAccessToken) {
    return NextResponse.redirect(new URL(withLocale(locale, "/login"), request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/:locale/dashboard/:path*"],
}
