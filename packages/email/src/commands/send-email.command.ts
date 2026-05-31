import { z } from 'zod'
import { defaultEmailLocale, emailLocales } from '../i18n/config'
import { emailTemplatePayloadSchema } from '../templates/registry'

export const sendEmailCommandSchema = z.object({
  to: z.string().email(),
  from: z.string().email().optional(),
  replyTo: z.string().email().optional(),
  locale: z.enum(emailLocales).default(defaultEmailLocale),
  idempotencyKey: z.string().min(1).max(180).optional(),
  metadata: z.record(z.string(), z.string()).default({}),
  content: emailTemplatePayloadSchema,
})

export type SendEmailCommand = z.input<typeof sendEmailCommandSchema>
export type ParsedSendEmailCommand = z.output<typeof sendEmailCommandSchema>
