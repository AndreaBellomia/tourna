import { ZodSerializationException } from 'nestjs-zod'
import { ZodError } from 'zod'
import { createExceptionHandler } from '~/error/error.type'

export const zodSerializationHandler = createExceptionHandler(
  ZodSerializationException,
  (error, context) => {
    const zodError = error.getZodError()

    if (zodError instanceof ZodError) {
      context.logger.error(`ZodSerializationException: ${zodError.message}`)
    }

    return error
  },
)
