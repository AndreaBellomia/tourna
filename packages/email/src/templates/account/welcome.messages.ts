import type { EmailLocale } from '../../i18n/config'

export interface WelcomeEmailMessageResource {
  preview: string
  title: string
  body: string
  cta: string
  subject: string
  text: string
}

export const welcomeEmailMessages = {
  it: {
    preview: 'Benvenuto su Tourna. Il tuo workspace torneo e pronto.',
    title: 'Benvenuto, {{displayName}}',
    body: 'Il tuo account Tourna e pronto. Ora puoi creare tornei, gestire iscrizioni e organizzare le operazioni del tuo evento da un unico spazio.',
    cta: 'Apri Tourna',
    subject: 'Benvenuto su Tourna, {{displayName}}',
    text:
      'Benvenuto, {{displayName}}.\n\nIl tuo account Tourna e pronto.\n\nApri Tourna: {{dashboardUrl}}',
  },
  en: {
    preview: 'Welcome to Tourna. Your tournament workspace is ready.',
    title: 'Welcome, {{displayName}}',
    body: 'Your Tourna account is ready. You can now create tournaments, manage registrations, and run event operations from one place.',
    cta: 'Open Tourna',
    subject: 'Welcome to Tourna, {{displayName}}',
    text:
      'Welcome, {{displayName}}.\n\nYour Tourna account is ready.\n\nOpen Tourna: {{dashboardUrl}}',
  },
} as const satisfies Record<EmailLocale, WelcomeEmailMessageResource>
