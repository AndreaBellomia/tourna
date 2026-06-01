jest.mock('@repo/db', () => {
  class InvalidCursorError extends Error {
    constructor(message = 'Invalid pagination cursor') {
      super(message)
      this.name = 'InvalidCursorError'
    }
  }

  return {
    InvalidCursorError,
    paginateCursor: jest.fn(),
  }
})

import { ArgumentsHost, BadRequestException, Logger } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { InvalidCursorError } from '@repo/db'
import { ZodSerializationException } from 'nestjs-zod'
import { z } from 'zod'
import { AppExceptionFilter } from './error.filter'
import { ExceptionHandlerRegistry } from './error.registry'
import { exceptionHandlers } from './handlers'

describe('AppExceptionFilter', () => {
  let superCatchSpy: jest.SpiedFunction<BaseExceptionFilter['catch']>
  let loggerErrorSpy: jest.SpiedFunction<Logger['error']>

  beforeEach(() => {
    superCatchSpy = jest
      .spyOn(BaseExceptionFilter.prototype, 'catch')
      .mockImplementation(() => undefined)
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    superCatchSpy.mockRestore()
    loggerErrorSpy.mockRestore()
  })

  it('maps invalid cursor errors to a bad request exception', () => {
    const filter = new AppExceptionFilter(new ExceptionHandlerRegistry(exceptionHandlers))
    const host = {} as ArgumentsHost

    filter.catch(new InvalidCursorError('Cursor malformed'), host)

    expect(superCatchSpy).toHaveBeenCalledTimes(1)

    const firstCall = superCatchSpy.mock.calls[0]

    if (!firstCall) {
      throw new Error('Expected BaseExceptionFilter.catch to be called')
    }

    const [exception, forwardedHost] = firstCall as [BadRequestException, ArgumentsHost]

    expect(forwardedHost).toBe(host)
    expect(exception).toBeInstanceOf(BadRequestException)
    expect(exception.getResponse()).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Cursor malformed',
      code: 'INVALID_CURSOR',
    })
  })

  it('routes zod serialization exceptions through the handler and logs them', () => {
    const filter = new AppExceptionFilter(new ExceptionHandlerRegistry(exceptionHandlers))
    const host = {} as ArgumentsHost
    const exception = new ZodSerializationException(
      new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          input: 42,
          path: ['createdAt'],
          message: 'Invalid input: expected string, received number',
        },
      ]),
    )

    filter.catch(exception, host)

    expect(superCatchSpy).toHaveBeenCalledWith(exception, host)
    expect(loggerErrorSpy).toHaveBeenCalled()
  })
})
