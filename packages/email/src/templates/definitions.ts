import { welcomeEmailDefinition } from './account/welcome.email'
import { tournamentReportReadyEmailDefinition } from './reports/tournament-report-ready.email'

export const emailTemplateDefinitions = {
  welcome: welcomeEmailDefinition,
  'tournament-report-ready': tournamentReportReadyEmailDefinition,
} as const
