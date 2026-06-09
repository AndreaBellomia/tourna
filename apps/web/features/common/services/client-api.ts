'use client'

import { z } from 'zod'
import { appendClientQuery, type ClientQueryParams } from './client-query'
import { ClientApiError, isUnauthorizedClientApiError } from './client-api-error'
import { redirectBrowserToLogin } from './client-navigation'
import { resolveClientLocale, setLocaleHeaders } from '~/lib/api/locale-header'

type ClientApiRequestOptions<TSchema extends z.ZodType> = Omit<RequestInit, 'body' | 'headers'> & {
  path: string
  schema: TSchema
  body?: unknown
  fallbackErrorMessage: string
  headers?: HeadersInit
  query?: ClientQueryParams
  redirectToLoginOnUnauthorized?: boolean
}

export async function clientApiRequest<TSchema extends z.ZodType>({
  path,
  schema,
  body,
  fallbackErrorMessage,
  headers,
  query,
  redirectToLoginOnUnauthorized = true,
  ...requestInit
}: ClientApiRequestOptions<TSchema>): Promise<z.infer<TSchema>> {
  const response = await fetch(appendClientQuery(path, query), {
    ...requestInit,
    headers: createJsonHeaders(headers, body),
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const payload = await readJsonPayload(response)

  if (!response.ok) {
    const error = createClientApiError(response, payload, fallbackErrorMessage)

    if (redirectToLoginOnUnauthorized && isUnauthorizedClientApiError(error)) {
      redirectBrowserToLogin()
    }

    throw error
  }

  return schema.parse(payload)
}

function createJsonHeaders(headers: HeadersInit | undefined, body: unknown) {
  const requestHeaders = new Headers(headers)

  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json')
  }

  if (body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (!requestHeaders.has('x-locale') && !requestHeaders.has('x-tourna-locale')) {
    setLocaleHeaders(requestHeaders, resolveClientLocale())
  }

  return requestHeaders
}

async function readJsonPayload(response: Response): Promise<unknown> {
  return response.json().catch(() => (response.ok ? undefined : { message: response.statusText }))
}

function createClientApiError(response: Response, payload: unknown, fallbackMessage: string) {
  const errorPayload = readErrorPayload(payload)

  return new ClientApiError(response.status, readErrorMessage(payload, fallbackMessage), {
    code: errorPayload.code,
    details: errorPayload.details,
  })
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
