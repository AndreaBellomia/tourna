import { Inject, Injectable } from '@nestjs/common'
import { ExceptionHandlerDefinition } from './error.type'
import { EXCEPTION_HANDLERS } from './handlers'

@Injectable()
export class ExceptionHandlerRegistry {
  constructor(
    @Inject(EXCEPTION_HANDLERS)
    private readonly handlers: ReadonlyArray<ExceptionHandlerDefinition>,
  ) {}

  find(exception: unknown): ExceptionHandlerDefinition | undefined {
    if (!(exception instanceof Error)) {
      return undefined
    }

    return this.handlers.find((handler) => exception instanceof handler.instanceOf)
  }
}
