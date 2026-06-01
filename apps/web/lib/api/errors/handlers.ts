import z, { ZodError } from 'zod'
import { ApiError } from './api-error'
import { createExceptionHandler } from './exception-handler'

export const exceptionHandlers = [
  createExceptionHandler(ApiError, (error) => ({
    status: error.status,
    body: {
      message: error.message,
      code: error.code,
      details: error.details,
    },
  })),

  createExceptionHandler(ZodError, (error) => ({
    status: 400,
    body: {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: z.treeifyError(error),
    },
  })),
] as const
