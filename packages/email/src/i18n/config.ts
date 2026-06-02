export const emailLocales = ['en', 'it'] as const

export type EmailLocale = (typeof emailLocales)[number]

export const defaultEmailLocale: EmailLocale = 'en'

export function isEmailLocale(value: string): value is EmailLocale {
  return emailLocales.includes(value as EmailLocale)
}
