export const emailLocales = ['it', 'en'] as const

export type EmailLocale = (typeof emailLocales)[number]

export const defaultEmailLocale: EmailLocale = 'it'

export function isEmailLocale(value: string): value is EmailLocale {
  return emailLocales.includes(value as EmailLocale)
}
