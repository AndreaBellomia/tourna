import { Text } from 'react-email'
import { EmailButton } from '../../core/components/email-button'
import { EmailShell } from '../../core/components/email-shell'
import type { EmailRenderContext } from '../../core/email-render-context'
import { emailTheme } from '../../core/theme/tokens'
import type { EmailTemplateDefinition } from '../types'
import {
  postRegistrationNotificationEmailSchema,
  type PostRegistrationNotificationEmailProps,
} from './post-registration-notification.contract'

interface PostRegistrationNotificationEmailTemplateProps {
  data: PostRegistrationNotificationEmailProps
  context: EmailRenderContext
}

export function PostRegistrationNotificationEmailTemplate({
  data,
  context,
}: PostRegistrationNotificationEmailTemplateProps) {
  return (
    <EmailShell
      preview={context.account('postRegistrationNotification.preview')}
      title={context.account('postRegistrationNotification.title')}
      footer={context.shell('footer')}
    >
      <Text style={{ color: emailTheme.colors.text, fontSize: '16px', lineHeight: '24px' }}>
        {context.account('postRegistrationNotification.greeting', {
          displayName: data.displayName,
        })}
      </Text>
      <Text style={{ color: emailTheme.colors.text, fontSize: '16px', lineHeight: '24px' }}>
        {context.account('postRegistrationNotification.body')}
      </Text>
      <EmailButton href={data.verificationUrl}>
        {context.account('postRegistrationNotification.cta')}
      </EmailButton>
      <Text style={{ color: emailTheme.colors.muted, fontSize: '14px', lineHeight: '22px' }}>
        {context.account('postRegistrationNotification.accountLabel')}: {data.email}
      </Text>
    </EmailShell>
  )
}

export const postRegistrationNotificationEmailDefinition = {
  name: 'post-registration-notification',
  schema: postRegistrationNotificationEmailSchema,
  subject: (_props, context) => context.account('postRegistrationNotification.subject'),
  text: (props, context) =>
    context.account('postRegistrationNotification.text', {
      displayName: props.displayName,
      email: props.email,
      verificationUrl: props.verificationUrl,
    }),
  render: (props, context) => (
    <PostRegistrationNotificationEmailTemplate data={props} context={context} />
  ),
} satisfies EmailTemplateDefinition<PostRegistrationNotificationEmailProps>
