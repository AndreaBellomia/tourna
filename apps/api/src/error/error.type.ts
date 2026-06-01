import { HttpException, LoggerService } from '@nestjs/common'

export type ErrorConstructor<T extends Error = Error> = abstract new (...args: never[]) => T

export interface ExceptionHandlerContext {
  logger: LoggerService
}

export interface ExceptionHandlerDefinition {
  instanceOf: ErrorConstructor<Error>
  toHttpException(error: Error, context: ExceptionHandlerContext): HttpException
}

export function createExceptionHandler<T extends Error>(
  instanceOf: ErrorConstructor<T>,
  toHttpException: (error: T, context: ExceptionHandlerContext) => HttpException,
): ExceptionHandlerDefinition {
  return {
    instanceOf,
    toHttpException(error, context) {
      if (!(error instanceof instanceOf)) {
        throw new TypeError(`Unexpected error type for handler ${instanceOf.name}`)
      }

      return toHttpException(error, context)
    },
  }
}
