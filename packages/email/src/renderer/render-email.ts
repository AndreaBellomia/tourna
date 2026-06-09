import { createEmailEngine, renderWithEmailEngine, type EmailEngine } from '../core/email.engine'
import { createEmailRenderContext } from '../core/email-render-context'
import { defaultEmailLocale, type EmailLocale } from '../i18n/config'
import { emailTemplatePayloadSchema, type EmailTemplatePayload } from '../templates/registry'

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

export async function renderEmail(
  payload: EmailTemplatePayload,
  locale: EmailLocale = defaultEmailLocale,
): Promise<RenderedEmail> {
  const parsedPayload = emailTemplatePayloadSchema.parse(payload)
  return renderWithEmailEngine(createEmailEngine(), parsedPayload, locale)
}

export async function renderEmailWithEngine(
  engine: EmailEngine,
  payload: EmailTemplatePayload,
  locale: EmailLocale = defaultEmailLocale,
): Promise<RenderedEmail> {
  const parsedPayload = emailTemplatePayloadSchema.parse(payload)
  return engine.render(parsedPayload, await createEmailRenderContext(locale))
}
