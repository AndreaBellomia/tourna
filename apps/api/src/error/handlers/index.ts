import { ExceptionHandlerDefinition } from '~/error/error.type'
import { invalidCursorHandler } from './invalid-cursor.handler'
import { zodSerializationHandler } from './zod-serialization.handler'

export * from './invalid-cursor.handler'
export * from './zod-serialization.handler'

export const EXCEPTION_HANDLERS = Symbol('EXCEPTION_HANDLERS')

export const exceptionHandlers: ReadonlyArray<ExceptionHandlerDefinition> = [
  invalidCursorHandler,
  zodSerializationHandler,
]
