import { ArgumentsHost, Catch, Logger } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { ExceptionHandlerRegistry } from './error.registry'

@Catch()
export class AppExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name)

  constructor(private readonly registry: ExceptionHandlerRegistry) {
    super()
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const handler = this.registry.find(exception)

    if (handler && exception instanceof Error) {
      super.catch(handler.toHttpException(exception, { logger: this.logger }), host)
      return
    }

    super.catch(exception as Error, host)
  }
}
