import { z } from 'zod'
import { createEmailTemplateNames, createEmailTemplatePayloadSchema } from '../core/email-template'
import { welcomeEmailSchema } from './account/welcome.contract'
import { tournamentReportReadyEmailSchema } from './reports/tournament-report-ready.contract'

export const emailTemplateSchemas = {
  welcome: welcomeEmailSchema,
  'tournament-report-ready': tournamentReportReadyEmailSchema,
} as const

const emailTemplateSchemaCollections = [emailTemplateSchemas] as const

export const EMAIL_TEMPLATE_NAMES = createEmailTemplateNames(emailTemplateSchemaCollections)

export const emailTemplatePayloadSchema = createEmailTemplatePayloadSchema(
  emailTemplateSchemaCollections,
)

export type EmailTemplatePayload = z.infer<typeof emailTemplatePayloadSchema>
export type EmailTemplateName = EmailTemplatePayload['template']
