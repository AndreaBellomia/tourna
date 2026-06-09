import {
  AuthResponseSchema,
  VerifyEmailResponseSchema,
  VerifyEmailSchema,
  type LoginInput,
  type SignupInput,
} from '@repo/contracts/auth'
import { z } from 'zod'
import { apiUrl } from '~/lib/api/endpoints'
import { apiRequest } from '~/lib/api//http'
import { authEndpoints } from './auth.endpoint'

export function login(payload: LoginInput) {
  return apiRequest(authEndpoints.login, AuthResponseSchema, {
    method: 'POST',
    body: payload,
    cache: 'no-store',
  })
}

export function signup(payload: SignupInput) {
  return apiRequest(authEndpoints.signup, AuthResponseSchema, {
    method: 'POST',
    body: payload,
    cache: 'no-store',
  })
}

export function refresh(refreshToken: string) {
  return apiRequest(authEndpoints.refresh, AuthResponseSchema, {
    method: 'POST',
    body: { refreshToken },
    cache: 'no-store',
  })
}

export function verifyEmail(token: string) {
  return apiRequest(authEndpoints.verifyEmail, VerifyEmailResponseSchema, {
    method: 'POST',
    body: VerifyEmailSchema.parse({ token }),
    cache: 'no-store',
  })
}

export async function resendEmailVerification(accessToken: string): Promise<void> {
  await apiRequest(authEndpoints.resendEmailVerification, z.void(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })
}

export async function logout(accessToken: string): Promise<void> {
  const response = await fetch(apiUrl(authEndpoints.logout), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok && response.status !== 401) {
    throw new Error(`Logout failed: ${response.status}`)
  }
}
