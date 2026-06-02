import { type NextRequest, NextResponse } from 'next/server'
import type { z } from 'zod'
import type { AuthResponse } from '@repo/contracts/auth'
import type { Locale } from '../../i18n/config'
import { refresh } from './auth.request'
import { ApiError } from '../errors/api-error'
import { apiRequest } from '../http'
import { readLocaleFromHeaders, setLocaleHeaders } from '../locale-header'
import { unauthorized } from '../responses'
import { readRequestAuthTokens, setAuthCookies } from '../../auth/session'

type AuthenticatedRequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown
  headers?: HeadersInit
  locale?: Locale
}

export type AuthenticatedApiResult<T> = {
  data: T
  auth?: AuthResponse
}

export async function authenticatedApiRequest<TSchema extends z.ZodType>(
  request: NextRequest,
  path: string,
  schema: TSchema,
  options: AuthenticatedRequestOptions = {},
): Promise<AuthenticatedApiResult<z.infer<TSchema>>> {
  const tokens = readRequestAuthTokens(request)

  if (!tokens.refreshToken) {
    console.warn('[auth] protected api request without refresh token', { path })
    throw unauthorized('Authentication required')
  }

  let auth: AuthResponse | undefined
  let accessToken = tokens.accessToken

  if (!accessToken) {
    console.info('[auth] access token missing before request; refreshing session', { path })
    auth = await refresh(tokens.refreshToken)
    accessToken = auth.accessToken
  }

  try {
    return {
      data: await requestWithAccessToken(request, path, schema, accessToken, options),
      auth,
    }
  } catch (error) {
    if (!shouldRefreshAfterError(error)) {
      throw error
    }

    console.info('[auth] access token rejected by backend; refreshing and retrying request', {
      path,
      code: error.code,
    })

    auth = await refresh(tokens.refreshToken)

    return {
      data: await requestWithAccessToken(request, path, schema, auth.accessToken, options),
      auth,
    }
  }
}

export async function optionalAuthenticatedApiRequest<TSchema extends z.ZodType>(
  request: NextRequest,
  path: string,
  schema: TSchema,
  options: AuthenticatedRequestOptions = {},
): Promise<AuthenticatedApiResult<z.infer<TSchema>>> {
  const tokens = readRequestAuthTokens(request)

  if (!tokens.refreshToken) {
    return {
      data: await apiRequest(path, schema, withRequestLocale(request, options)),
    }
  }

  try {
    return await authenticatedApiRequest(request, path, schema, options)
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      console.warn('[auth] optional authenticated request fell back to public view', { path })

      return {
        data: await apiRequest(path, schema, withRequestLocale(request, options)),
      }
    }

    throw error
  }
}

export function jsonWithAuth<T>(result: AuthenticatedApiResult<T>, init?: ResponseInit) {
  const response = NextResponse.json(result.data, init)

  if (result.auth) {
    setAuthCookies(response, result.auth)
  }

  return response
}

function requestWithAccessToken<TSchema extends z.ZodType>(
  request: NextRequest,
  path: string,
  schema: TSchema,
  accessToken: string,
  options: AuthenticatedRequestOptions,
) {
  const headers = new Headers(options.headers)
  setLocaleHeaders(headers, readLocaleFromHeaders(request.headers))

  return apiRequest(path, schema, {
    ...options,
    headers: {
      ...Object.fromEntries(headers.entries()),
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

function withRequestLocale(
  request: NextRequest,
  options: AuthenticatedRequestOptions,
): AuthenticatedRequestOptions {
  return {
    ...options,
    locale: readLocaleFromHeaders(request.headers),
  }
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
