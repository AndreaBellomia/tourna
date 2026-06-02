import type { EmailLocale } from './config'
import type { TranslationResourceShape } from './resource-shape'

const englishEmailShellMessages = {
  footer: 'You are receiving this message because a Tourna workflow generated it.',
} as const

export type EmailShellResource = TranslationResourceShape<typeof englishEmailShellMessages>

export const emailShellMessages = {
  en: englishEmailShellMessages,
  it: {
    footer: 'Hai ricevuto questo messaggio perche un flusso Tourna lo ha generato.',
  } satisfies EmailShellResource,
} as const satisfies Record<EmailLocale, EmailShellResource>
