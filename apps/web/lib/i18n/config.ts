export const locales = ["en", "it"] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

export function resolveLocale(value: string): Locale {
  return isLocale(value) ? value : defaultLocale
}

export function withLocale(locale: Locale, path: string) {
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`
}
