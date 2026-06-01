import { z } from 'zod'
import { apiUrl } from './endpoints'
import { ApiError } from './errors/api-error'

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

export async function apiRequest<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  options: ApiRequestOptions = {},
): Promise<z.infer<TSchema>> {
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const payload: unknown = await response
    .json()
    .catch(() => (response.ok ? undefined : { message: response.statusText }))

  if (!response.ok) {
    throw new ApiError(
      response.status,
      readErrorMessage(payload, 'Request failed'),
      readErrorPayload(payload).code,
      readErrorPayload(payload).details,
    )
  }

  return schema.parse(payload)
}

function readErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = payload.message

    if (typeof message === 'string') return message
    if (Array.isArray(message) && typeof message[0] === 'string') return message[0]
  }

  return fallback
}

function readErrorPayload(payload: unknown) {
  if (payload && typeof payload === 'object') {
    const { code, details } = payload as { code?: unknown; details?: unknown }

    return {
      code: typeof code === 'string' ? code : 'API_ERROR',
      details,
    }
  }

  return {
    code: 'API_ERROR',
    details: undefined,
  }
}
