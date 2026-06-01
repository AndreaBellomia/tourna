import { NextRequest, NextResponse } from 'next/server'
import { exceptionHandlers } from './errors/handlers'

type RouteContext = {
  params?: Promise<Record<string, string | string[]>>
}

type RouteHandler<TContext extends RouteContext = RouteContext> = (
  request: NextRequest,
  context: TContext,
) => Promise<Response> | Response

type RouteExceptionHandler = (
  exception: unknown,
  request: NextRequest,
) => Promise<Response | undefined> | Response | undefined

type RouteHandlerOptions = {
  onError?: RouteExceptionHandler
}

export function withRouteHandler<TContext extends RouteContext>(
  handler: RouteHandler<TContext>,
  options: RouteHandlerOptions = {},
): RouteHandler<TContext> {
  return async (request, context) => {
    try {
      return await handler(request, context)
    } catch (exception) {
      const customResponse = await options.onError?.(exception, request)

      if (customResponse) {
        return customResponse
      }

      return handleRouteException(exception)
    }
  }
}

function handleRouteException(exception: unknown): Response {
  if (exception instanceof Error) {
    for (const definition of exceptionHandlers) {
      if (!definition.canHandle(exception)) {
        continue
      }

      const response = definition.toResponse(exception)

      return NextResponse.json(response.body, {
        status: response.status,
      })
    }

    console.error(exception)
  }

  return NextResponse.json(
    {
      message: 'Request failed',
      code: 'INTERNAL_SERVER_ERROR',
    },
    {
      status: 500,
    },
  )
}
