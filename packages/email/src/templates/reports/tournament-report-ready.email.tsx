import { Text } from 'react-email'
import { EmailButton } from '../../core/components/email-button'
import { EmailShell } from '../../core/components/email-shell'
import type { EmailRenderContext } from '../../core/email-render-context'
import { emailTheme } from '../../core/theme/tokens'
import type { EmailTemplateDefinition } from '../types'
import {
  type TournamentReportReadyEmailProps,
  tournamentReportReadyEmailSchema,
} from './tournament-report-ready.contract'

interface TournamentReportReadyEmailTemplateProps {
  data: TournamentReportReadyEmailProps
  context: EmailRenderContext
}

export function TournamentReportReadyEmailTemplate({
  data,
  context,
}: TournamentReportReadyEmailTemplateProps) {
  const formatLabel = data.format.toUpperCase()

  return (
    <EmailShell
      preview={context.reports('tournamentReportReady.preview', {
        tournamentName: data.tournamentName,
      })}
      title={context.reports('tournamentReportReady.title')}
      footer={context.shell('footer')}
    >
      <Text style={{ color: emailTheme.colors.text, fontSize: '16px', lineHeight: '24px' }}>
        {context.reports('tournamentReportReady.body', {
          format: formatLabel,
          tournamentName: data.tournamentName,
        })}
      </Text>
      <EmailButton href={data.reportUrl}>
        {context.reports('tournamentReportReady.cta')}
      </EmailButton>
    </EmailShell>
  )
}

export const tournamentReportReadyEmailDefinition = {
  name: 'tournament-report-ready',
  schema: tournamentReportReadyEmailSchema,
  subject: (props, context) =>
    context.reports('tournamentReportReady.subject', {
      tournamentName: props.tournamentName,
    }),
  text: (props, context) =>
    context.reports('tournamentReportReady.text', {
      tournamentName: props.tournamentName,
      format: props.format.toUpperCase(),
      reportUrl: props.reportUrl,
    }),
  render: (props, context) => <TournamentReportReadyEmailTemplate data={props} context={context} />,
} satisfies EmailTemplateDefinition<TournamentReportReadyEmailProps>
