import type { EmailLocale } from '../../i18n/config'
import type { TranslationResourceShape } from '../../i18n/resource-shape'

const englishPostRegistrationNotificationEmailMessages = {
  preview: 'Your Tourna account has been created.',
  title: 'Registration completed',
  greeting: 'Hi {{displayName}},',
  body: 'Your Tourna account has been created successfully. Verify this email address to keep your account ready for tournament operations.',
  cta: 'Verify email',
  accountLabel: 'Registered email',
  subject: 'Your Tourna registration is complete',
  text: 'Hi {{displayName}},\n\nYour Tourna account has been created successfully. Verify this email address here:\n{{verificationUrl}}\n\nRegistered email: {{email}}',
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
    body: 'Il tuo account Tourna e stato creato correttamente. Verifica questo indirizzo email per mantenere l account pronto per gestire i tornei.',
    cta: 'Verifica email',
    accountLabel: 'Email registrata',
    subject: 'La tua registrazione a Tourna e completa',
    text: 'Ciao {{displayName}},\n\nIl tuo account Tourna e stato creato correttamente. Verifica questo indirizzo email qui:\n{{verificationUrl}}\n\nEmail registrata: {{email}}',
  } satisfies PostRegistrationNotificationEmailMessageResource,
} as const satisfies Record<EmailLocale, PostRegistrationNotificationEmailMessageResource>
