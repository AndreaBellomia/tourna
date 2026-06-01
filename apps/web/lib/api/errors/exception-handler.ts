export type ExceptionResponse = {
  status: number
  body: {
    message: string
    code?: string
    details?: unknown
  }
}

export type ExceptionHandlerDefinition = {
  canHandle: (error: Error) => boolean
  toResponse: (error: Error) => ExceptionResponse
}

export function createExceptionHandler<TError extends Error>(
  instanceOf: new (...args: never[]) => TError,
  toResponse: (error: TError) => ExceptionResponse,
): ExceptionHandlerDefinition {
  return {
    canHandle: (error) => error instanceof instanceOf,
    toResponse: (error) => toResponse(error as TError),
  }
}
