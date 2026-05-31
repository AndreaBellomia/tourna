import type { ReactElement } from 'react'
import type { z } from 'zod'
import type { EmailRenderContext } from '../core/email-render-context'

type BivariantCallback<TArgs extends unknown[], TResult> = {
  bivarianceHack(...args: TArgs): TResult
}['bivarianceHack']

export interface EmailTemplateDefinition<TProps> {
  name: string
  schema: z.ZodType<TProps>
  subject: BivariantCallback<[props: TProps, context: EmailRenderContext], string>
  text: BivariantCallback<[props: TProps, context: EmailRenderContext], string>
  render: BivariantCallback<[props: TProps, context: EmailRenderContext], ReactElement>
}
