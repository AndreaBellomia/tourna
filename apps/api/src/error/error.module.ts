import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { AppExceptionFilter } from './error.filter'
import { ExceptionHandlerRegistry } from './error.registry'
import { exceptionHandlers, EXCEPTION_HANDLERS } from './handlers'

@Module({
  providers: [
    ExceptionHandlerRegistry,
    {
      provide: EXCEPTION_HANDLERS,
      useValue: exceptionHandlers,
    },
    {
      provide: APP_FILTER,
      useClass: AppExceptionFilter,
    },
  ],
})
export class ErrorModule {}
