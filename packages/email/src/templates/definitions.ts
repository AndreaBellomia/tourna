import { postRegistrationNotificationEmailDefinition } from './account/post-registration-notification.email'
import { welcomeEmailDefinition } from './account/welcome.email'
import { tournamentReportReadyEmailDefinition } from './reports/tournament-report-ready.email'

export const emailTemplateDefinitions = {
  'post-registration-notification': postRegistrationNotificationEmailDefinition,
  welcome: welcomeEmailDefinition,
  'tournament-report-ready': tournamentReportReadyEmailDefinition,
} as const
