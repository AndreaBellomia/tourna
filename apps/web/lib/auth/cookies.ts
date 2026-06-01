import { getWebBackendConfig } from '../backend/config'

export const authCookieNames = {
  accessToken: 'tourna_access_token',
  refreshToken: 'tourna_refresh_token',
  sessionId: 'tourna_session_id',
} as const

export const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: getWebBackendConfig().NODE_ENV === 'production',
  path: '/',
} as const

export const accessTokenMaxAge = 60 * 15
export const refreshTokenMaxAge = 60 * 60 * 24 * 30
