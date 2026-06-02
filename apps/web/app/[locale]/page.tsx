import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { authCookieNames } from '../../lib/auth/cookies'
import { isLocale, withLocale } from '../../lib/i18n/config'

type LocaleIndexPageProps = {
  params: Promise<{ locale: string }>
}

export default async function LocaleIndexPage({ params }: LocaleIndexPageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const cookieStore = await cookies()
  const destination = cookieStore.has(authCookieNames.refreshToken) ? '/dashboard' : '/login'

  redirect(withLocale(locale, destination))
}
