import type { EmailLocale } from './config'
import { emailShellMessages, type EmailShellResource } from './shell.messages'
import {
  welcomeEmailMessages,
  type WelcomeEmailMessageResource,
} from '../templates/account/welcome.messages'
import {
  tournamentReportReadyEmailMessages,
  type TournamentReportReadyEmailMessageResource,
} from '../templates/reports/tournament-report-ready.messages'

interface EmailAccountResource {
  welcome: WelcomeEmailMessageResource
}

interface EmailReportsResource {
  tournamentReportReady: TournamentReportReadyEmailMessageResource
}

export const emailI18nResources = {
  it: {
    shell: emailShellMessages.it,
    account: {
      welcome: welcomeEmailMessages.it,
    },
    reports: {
      tournamentReportReady: tournamentReportReadyEmailMessages.it,
    },
  },
  en: {
    shell: emailShellMessages.en,
    account: {
      welcome: welcomeEmailMessages.en,
    },
    reports: {
      tournamentReportReady: tournamentReportReadyEmailMessages.en,
    },
  },
} as const satisfies Record<
  EmailLocale,
  {
    shell: EmailShellResource
    account: EmailAccountResource
    reports: EmailReportsResource
  }
>

export const emailI18nNamespaces = ['shell', 'account', 'reports'] as const

export type EmailI18nNamespace = (typeof emailI18nNamespaces)[number]
export type EmailI18nResourceShape = (typeof emailI18nResources)['it']
