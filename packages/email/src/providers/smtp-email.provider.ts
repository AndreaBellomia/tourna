import nodemailer from 'nodemailer'
import type { EmailDeliveryReceipt, EmailProvider, SendRenderedEmailInput } from './email.provider'

export interface SmtpEmailProviderConfig {
  host: string
  port: number
  secure: boolean
  user?: string
  password?: string
  defaultFrom?: string
  defaultReplyTo?: string
}

export class SmtpEmailProvider implements EmailProvider {
  private readonly transporter

  constructor(private readonly config: SmtpEmailProviderConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.user ? { user: config.user, pass: config.password } : undefined,
    })
  }

  async send(input: SendRenderedEmailInput): Promise<EmailDeliveryReceipt> {
    const info = await this.transporter.sendMail({
      from: input.envelope.from ?? this.config.defaultFrom,
      replyTo: input.envelope.replyTo ?? this.config.defaultReplyTo,
      to: input.envelope.to,
      subject: input.email.subject,
      html: input.email.html,
      text: input.email.text,
      headers: input.envelope.metadata,
    })

    return {
      provider: 'smtp',
      messageId: info.messageId,
    }
  }
}
