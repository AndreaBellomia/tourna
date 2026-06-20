import { cookies } from 'next/headers'
import type { z } from 'zod'
import { authCookieNames } from '~/lib/auth/cookies'
import { ApiError } from '~/lib/api/errors/api-error'
import { unauthorized } from '~/lib/api/responses'
import { apiRequest } from '~/lib/api/http'
import type { Locale } from '~/lib/i18n/config'
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

export async function optionalAuthenticatedServerApiRequest<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  options: ServerAuthenticatedRequestOptions = {},
): Promise<z.infer<TSchema>> {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(authCookieNames.refreshToken)?.value

  if (!refreshToken) {
    return apiRequest(path, schema, options)
  }

  try {
    return await authenticatedServerApiRequest(path, schema, options)
  } catch (error) {
    if (shouldFallbackToPublicRequest(error)) {
      console.warn('[auth] optional server api request fell back to public view', {
        path,
        reason: readFallbackReason(error),
      })

      return apiRequest(path, schema, options)
    }

    throw error
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

function shouldFallbackToPublicRequest(error: unknown) {
  return (error instanceof ApiError && error.status === 401) || isFetchFailure(error)
}

function isFetchFailure(error: unknown): error is TypeError {
  return error instanceof TypeError && error.message === 'fetch failed'
}

function readFallbackReason(error: unknown) {
  if (error instanceof ApiError) {
    return `${error.status}:${error.code}`
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'unknown'
}
