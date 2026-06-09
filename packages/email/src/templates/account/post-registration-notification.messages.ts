import type { EmailLocale } from '../../i18n/config'
import type { TranslationResourceShape } from '../../i18n/resource-shape'

const englishPostRegistrationNotificationEmailMessages = {
  preview: 'Your Tourna account has been created.',
  title: 'Registration completed',
  greeting: 'Hi {{displayName}},',
  body: 'Your Tourna account has been created successfully. You can now use this email address to access your account.',
  accountLabel: 'Registered email',
  subject: 'Your Tourna registration is complete',
  text: 'Hi {{displayName}},\n\nYour Tourna account has been created successfully.\n\nRegistered email: {{email}}',
} as const

export type PostRegistrationNotificationEmailMessageResource = TranslationResourceShape<
  typeof englishPostRegistrationNotificationEmailMessages
>

export const postRegistrationNotificationEmailMessages = {
  en: englishPostRegistrationNotificationEmailMessages,
  it: {
    preview: 'Il tuo account Tourna e stato creato.',
    title: 'Registrazione completata',
    greeting: 'Ciao {{displayName}},',
    body: 'Il tuo account Tourna e stato creato correttamente. Ora puoi usare questo indirizzo email per accedere al tuo account.',
    accountLabel: 'Email registrata',
    subject: 'La tua registrazione a Tourna e completa',
    text: 'Ciao {{displayName}},\n\nIl tuo account Tourna e stato creato correttamente.\n\nEmail registrata: {{email}}',
  } satisfies PostRegistrationNotificationEmailMessageResource,
} as const satisfies Record<EmailLocale, PostRegistrationNotificationEmailMessageResource>
