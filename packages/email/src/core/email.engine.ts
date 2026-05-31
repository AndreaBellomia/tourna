import { createEmailRenderContext, type EmailRenderContext } from './email-render-context'
import type { EmailTemplatePayload } from '../contracts'
import { BaseEmailRenderer } from './email.renderer'
import { emailTemplateDefinitions } from '../templates/definitions'
import type { RenderedEmail } from '../renderer/render-email'

export class EmailEngine {
  private readonly renderer = new BaseEmailRenderer(emailTemplateDefinitions)

  async render(payload: EmailTemplatePayload, context: EmailRenderContext): Promise<RenderedEmail> {
    if (this.renderer.supports(payload.template)) {
      return this.renderer.render(payload, context)
    }

    throw new Error(`Unknown email template "${payload.template}"`)
  }
}

export function createEmailEngine(): EmailEngine {
  return new EmailEngine()
}

export function renderWithEmailEngine(
  engine: EmailEngine,
  payload: EmailTemplatePayload,
  locale?: Parameters<typeof createEmailRenderContext>[0],
): Promise<RenderedEmail> {
  return createEmailRenderContext(locale).then((context) => engine.render(payload, context))
}
