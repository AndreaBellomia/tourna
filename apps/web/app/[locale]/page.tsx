import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { authCookieNames } from '~/lib/auth/cookies'
import { withLocale } from '~/lib/i18n/config'
import { getLocaleParams } from '~/lib/i18n/web-i18n'

type LocaleIndexPageProps = {
  params: Promise<{ locale: string }>
}

export default async function LocaleIndexPage({ params }: LocaleIndexPageProps) {
  const { locale } = await getLocaleParams(params)

  const cookieStore = await cookies()
  const destination = cookieStore.has(authCookieNames.refreshToken) ? '/dashboard' : '/login'

  redirect(withLocale(locale, destination))
}
