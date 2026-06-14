import { renderToStaticMarkup } from 'react-dom/server'
import type { EmailTemplatePayload } from '../contracts'
import type { RenderedEmail } from '../renderer/render-email'
import type { EmailTemplateDefinition } from '../templates/types'
import type { EmailRenderContext } from './email-render-context'

export type EmailTemplateDefinitionRecord = Record<string, EmailTemplateDefinition<unknown>>

export class BaseEmailRenderer<TDefinitions extends EmailTemplateDefinitionRecord> {
  constructor(private readonly definitions: TDefinitions) {}

  supports(template: string): boolean {
    return template in this.definitions
  }

  render(payload: EmailTemplatePayload, context: EmailRenderContext): Promise<RenderedEmail> {
    const definition = this.definitions[payload.template]

    if (!definition) {
      throw new Error(`Renderer does not support template "${payload.template}"`)
    }

    const props = definition.schema.parse(payload.data)

    return Promise.resolve({
      subject: definition.subject(props, context),
      html: renderToStaticMarkup(definition.render(props, context)),
      text: definition.text(props, context),
    })
  }
}
