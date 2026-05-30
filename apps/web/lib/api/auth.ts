import { AuthResponseSchema, type LoginInput, type SignupInput } from '@repo/contracts/auth'
import { apiEndpoints, apiUrl } from './endpoints'
import { apiRequest } from './http'

export function login(payload: LoginInput) {
  return apiRequest(apiEndpoints.auth.login, AuthResponseSchema, {
    method: 'POST',
    body: payload,
    cache: 'no-store',
  })
}

export function signup(payload: SignupInput) {
  return apiRequest(apiEndpoints.auth.signup, AuthResponseSchema, {
    method: 'POST',
    body: payload,
    cache: 'no-store',
  })
}

export async function logout(accessToken: string): Promise<void> {
  const response = await fetch(apiUrl(apiEndpoints.auth.logout), {
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
