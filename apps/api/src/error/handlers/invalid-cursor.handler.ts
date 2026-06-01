import { BadRequestException, HttpStatus } from '@nestjs/common'
import { InvalidCursorError } from '@repo/db'
import { createExceptionHandler } from '../error.type'

export const invalidCursorHandler = createExceptionHandler(
  InvalidCursorError,
  (error) =>
    new BadRequestException({
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      message: error.message,
      code: 'INVALID_CURSOR',
    }),
)
