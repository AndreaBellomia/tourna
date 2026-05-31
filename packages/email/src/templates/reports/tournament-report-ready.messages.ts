import type { EmailLocale } from '../../i18n/config'

export interface TournamentReportReadyEmailMessageResource {
  preview: string
  title: string
  body: string
  cta: string
  subject: string
  text: string
}

export const tournamentReportReadyEmailMessages = {
  it: {
    preview: 'Il report di {{tournamentName}} e pronto.',
    title: 'Report torneo pronto',
    body: 'Il report {{format}} per {{tournamentName}} e stato generato ed e pronto da consultare.',
    cta: 'Apri report',
    subject: 'Il report di {{tournamentName}} e pronto',
    text:
      'Il report di {{tournamentName}} e pronto.\n\nFormato: {{format}}\n\nApri report: {{reportUrl}}',
  },
  en: {
    preview: '{{tournamentName}} report is ready.',
    title: 'Tournament report ready',
    body: 'The {{format}} report for {{tournamentName}} has been generated and is ready to review.',
    cta: 'Open report',
    subject: '{{tournamentName}} report is ready',
    text: '{{tournamentName}} report is ready.\n\nFormat: {{format}}\n\nOpen report: {{reportUrl}}',
  },
} as const satisfies Record<EmailLocale, TournamentReportReadyEmailMessageResource>
