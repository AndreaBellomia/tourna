import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { logout as revokeSession } from '~/lib/api/auth/auth.request'
import { authCookieNames } from '~/lib/auth/cookies'
import { type Locale, withLocale } from '~/lib/i18n/config'

export async function logout(locale: Locale) {
  'use server'

  const cookieStore = await cookies()
  const accessToken = cookieStore.get(authCookieNames.accessToken)?.value

  if (accessToken) {
    try {
      await revokeSession(accessToken)
    } catch {
      // Best-effort: clear cookies even if backend revocation fails.
    }
  }

  cookieStore.delete(authCookieNames.accessToken)
  cookieStore.delete(authCookieNames.refreshToken)
  cookieStore.delete(authCookieNames.sessionId)

  redirect(withLocale(locale, '/login'))
}
