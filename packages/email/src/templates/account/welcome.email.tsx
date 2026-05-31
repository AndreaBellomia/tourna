import { Text } from 'react-email'
import { EmailButton } from '../../core/components/email-button'
import { EmailShell } from '../../core/components/email-shell'
import type { EmailRenderContext } from '../../core/email-render-context'
import { emailTheme } from '../../core/theme/tokens'
import type { EmailTemplateDefinition } from '../types'
import { type WelcomeEmailProps, welcomeEmailSchema } from './welcome.contract'

interface WelcomeEmailTemplateProps {
  data: WelcomeEmailProps
  context: EmailRenderContext
}

export function WelcomeEmailTemplate({ data, context }: WelcomeEmailTemplateProps) {
  return (
    <EmailShell
      preview={context.account('welcome.preview')}
      title={context.account('welcome.title', { displayName: data.displayName })}
      footer={context.shell('footer')}
    >
      <Text style={{ color: emailTheme.colors.text, fontSize: '16px', lineHeight: '24px' }}>
        {context.account('welcome.body')}
      </Text>
      <EmailButton href={data.dashboardUrl}>{context.account('welcome.cta')}</EmailButton>
    </EmailShell>
  )
}

export const welcomeEmailDefinition = {
  name: 'welcome',
  schema: welcomeEmailSchema,
  subject: (props, context) =>
    context.account('welcome.subject', { displayName: props.displayName }),
  text: (props, context) =>
    context.account('welcome.text', {
      displayName: props.displayName,
      dashboardUrl: props.dashboardUrl,
    }),
  render: (props, context) => <WelcomeEmailTemplate data={props} context={context} />,
} satisfies EmailTemplateDefinition<WelcomeEmailProps>
