import type { EmailLocale } from './config'
import type { TranslationResourceShape } from './resource-shape'
import { emailShellMessages } from './shell.messages'
import { postRegistrationNotificationEmailMessages } from '../templates/account/post-registration-notification.messages'
import { welcomeEmailMessages } from '../templates/account/welcome.messages'
import { tournamentReportReadyEmailMessages } from '../templates/reports/tournament-report-ready.messages'

const defaultEmailI18nResource = {
  shell: emailShellMessages.en,
  account: {
    postRegistrationNotification: postRegistrationNotificationEmailMessages.en,
    welcome: welcomeEmailMessages.en,
  },
  reports: {
    tournamentReportReady: tournamentReportReadyEmailMessages.en,
  },
} as const

export type EmailI18nResourceShape = TranslationResourceShape<typeof defaultEmailI18nResource>
export type EmailI18nNamespace = keyof EmailI18nResourceShape

const italianEmailI18nResource = {
  shell: emailShellMessages.it,
  account: {
    postRegistrationNotification: postRegistrationNotificationEmailMessages.it,
    welcome: welcomeEmailMessages.it,
  },
  reports: {
    tournamentReportReady: tournamentReportReadyEmailMessages.it,
  },
} as const satisfies EmailI18nResourceShape

export const emailI18nResources = {
  en: defaultEmailI18nResource,
  it: italianEmailI18nResource,
} as const satisfies Record<EmailLocale, EmailI18nResourceShape>

export const emailI18nNamespaces = Object.keys(defaultEmailI18nResource) as EmailI18nNamespace[]
