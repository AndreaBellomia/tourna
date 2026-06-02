import type { EmailLocale } from '../../i18n/config'
import type { TranslationResourceShape } from '../../i18n/resource-shape'

const englishTournamentReportReadyEmailMessages = {
  preview: '{{tournamentName}} report is ready.',
  title: 'Tournament report ready',
  body: 'The {{format}} report for {{tournamentName}} has been generated and is ready to review.',
  cta: 'Open report',
  subject: '{{tournamentName}} report is ready',
  text: '{{tournamentName}} report is ready.\n\nFormat: {{format}}\n\nOpen report: {{reportUrl}}',
} as const

export type TournamentReportReadyEmailMessageResource =
  TranslationResourceShape<typeof englishTournamentReportReadyEmailMessages>

export const tournamentReportReadyEmailMessages = {
  en: englishTournamentReportReadyEmailMessages,
  it: {
    preview: 'Il report di {{tournamentName}} e pronto.',
    title: 'Report torneo pronto',
    body: 'Il report {{format}} per {{tournamentName}} e stato generato ed e pronto da consultare.',
    cta: 'Apri report',
    subject: 'Il report di {{tournamentName}} e pronto',
    text:
      'Il report di {{tournamentName}} e pronto.\n\nFormato: {{format}}\n\nApri report: {{reportUrl}}',
  } satisfies TournamentReportReadyEmailMessageResource,
} as const satisfies Record<EmailLocale, TournamentReportReadyEmailMessageResource>
