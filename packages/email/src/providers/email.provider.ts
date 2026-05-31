import type { RenderedEmail } from '../renderer/render-email'

export interface EmailEnvelope {
  to: string
  from?: string
  replyTo?: string
  metadata: Record<string, string>
}

export interface SendRenderedEmailInput {
  envelope: EmailEnvelope
  email: RenderedEmail
}

export interface EmailDeliveryReceipt {
  provider: string
  messageId?: string
}

export interface EmailProvider {
  send(input: SendRenderedEmailInput): Promise<EmailDeliveryReceipt>
}
