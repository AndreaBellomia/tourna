import { cookies } from 'next/headers'
import type { z } from 'zod'
import { authCookieNames } from '../../auth/cookies'
import { ApiError } from '../errors/api-error'
import { unauthorized } from '../responses'
import { apiRequest } from '../http'
import type { Locale } from '../../i18n/config'
import { refresh } from './auth.request'

type ServerAuthenticatedRequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown
  headers?: HeadersInit
  locale?: Locale
}

export async function authenticatedServerApiRequest<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  options: ServerAuthenticatedRequestOptions = {},
): Promise<z.infer<TSchema>> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(authCookieNames.accessToken)?.value
  const refreshToken = cookieStore.get(authCookieNames.refreshToken)?.value

  if (!refreshToken) {
    throw unauthorized('Authentication required')
  }

  if (!accessToken) {
    const auth = await refresh(refreshToken)

    return requestWithAccessToken(path, schema, auth.accessToken, options)
  }

  try {
    return await requestWithAccessToken(path, schema, accessToken, options)
  } catch (error) {
    if (!shouldRefreshAfterError(error)) {
      throw error
    }

    const auth = await refresh(refreshToken)

    return requestWithAccessToken(path, schema, auth.accessToken, options)
  }
}

function requestWithAccessToken<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  accessToken: string,
  options: ServerAuthenticatedRequestOptions,
) {
  return apiRequest(path, schema, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
    locale: options.locale,
  })
}

function shouldRefreshAfterError(error: unknown): error is ApiError {
  return (
    error instanceof ApiError &&
    error.status === 401 &&
    (error.code === 'AUTH_ACCESS_TOKEN_INVALID' ||
      error.code === 'AUTH_ACCESS_TOKEN_MISSING' ||
      error.code === 'Unauthorized')
  )
}
