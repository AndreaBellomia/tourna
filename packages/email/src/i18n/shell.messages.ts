import type { EmailLocale } from './config'

export interface EmailShellResource {
  footer: string
}

export const emailShellMessages = {
  it: {
    footer: 'Hai ricevuto questo messaggio perche un flusso Tourna lo ha generato.',
  },
  en: {
    footer: 'You are receiving this message because a Tourna workflow generated it.',
  },
} as const satisfies Record<EmailLocale, EmailShellResource>
