import type { Metadata } from 'next'
import { getMessages } from '../../../lib/i18n/web-i18n'
import { isLocale, resolveLocale, withLocale } from '../../../lib/i18n/config'
import { ProfileEditPanel } from '../../../features/profile/components/profile-edit'
import { notFound } from 'next/navigation'
import { requireAuthenticatedPage } from '../../../lib/auth/session'
import { getRequiredPageData } from '../../../lib/api/page-data'
import { getProfile } from '../../../lib/api/profile/profile.request'
import { AppHeader } from '../../../features/common/components/app-header'

type ProfilePageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { locale } = await params
  const messages = getMessages(resolveLocale(locale))

  return {
    title: messages.profile.metadata.title,
    description: messages.profile.metadata.description,
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  await requireAuthenticatedPage(locale)

  const messages = getMessages(locale)
  const profile = await getRequiredPageData(() => getProfile(locale), {
    context: `profile.page`,
    notFoundStatuses: [403, 404],
    unauthorizedRedirectTo: withLocale(locale, '/login'),
  })

  return (
    <main className="min-h-screen bg-background px-5 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <AppHeader active="profile" locale={locale} messages={messages.common} />
        <ProfileEditPanel initialProfile={profile} locale={locale} messages={messages.profile} />
      </div>
    </main>
  )
}
