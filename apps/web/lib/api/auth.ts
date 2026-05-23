import { AuthResponseSchema, type LoginInput, type SignupInput } from '@repo/contracts/auth'
import { apiEndpoints } from './endpoints'
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
