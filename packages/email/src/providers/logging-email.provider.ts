import type { EmailDeliveryReceipt, EmailProvider, SendRenderedEmailInput } from './email.provider'

export interface EmailProviderLogger {
  log(message: unknown): void
}

export class LoggingEmailProvider implements EmailProvider {
  constructor(private readonly logger: EmailProviderLogger = console) {}

  send(input: SendRenderedEmailInput): Promise<EmailDeliveryReceipt> {
    this.logger.log({
      message: 'Email rendered and accepted by logging provider',
      provider: 'logging',
      to: input.envelope.to,
      subject: input.email.subject,
      metadata: input.envelope.metadata,
    })

    return Promise.resolve({
      provider: 'logging',
    })
  }
}
