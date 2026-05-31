import { sendEmailCommandSchema, type SendEmailCommand } from '../commands/send-email.command'
import type { EmailEngine } from '../core/email.engine'
import { createEmailRenderContext } from '../core/email-render-context'
import type { EmailDeliveryReceipt, EmailProvider } from '../providers/email.provider'

export class EmailService {
  constructor(
    private readonly engine: EmailEngine,
    private readonly provider: EmailProvider,
  ) {}

  async send(command: SendEmailCommand): Promise<EmailDeliveryReceipt> {
    const parsedCommand = sendEmailCommandSchema.parse(command)
    const email = await this.engine.render(
      parsedCommand.content,
      await createEmailRenderContext(parsedCommand.locale),
    )

    return this.provider.send({
      envelope: {
        to: parsedCommand.to,
        from: parsedCommand.from,
        replyTo: parsedCommand.replyTo,
        metadata: parsedCommand.metadata,
      },
      email,
    })
  }
}
