import type { Locale } from '../i18n/config'
import { defaultLocale, isLocale } from '../i18n/config'

export const API_LOCALE_HEADER = 'x-locale'
export const LEGACY_API_LOCALE_HEADER = 'x-tourna-locale'

export function setLocaleHeaders(headers: Headers, locale: Locale): Headers {
  headers.set(API_LOCALE_HEADER, locale)
  headers.set(LEGACY_API_LOCALE_HEADER, locale)
  return headers
}

export function readLocaleFromHeaders(
  headers: Pick<Headers, 'get'>,
  fallback: Locale = defaultLocale,
): Locale {
  const locale =
    headers.get(API_LOCALE_HEADER) ?? headers.get(LEGACY_API_LOCALE_HEADER)

  return locale && isLocale(locale) ? locale : fallback
}

export function resolveClientLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale
  }

  const [, maybeLocale] = window.location.pathname.split('/')
  return maybeLocale && isLocale(maybeLocale) ? maybeLocale : defaultLocale
}
