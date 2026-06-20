import type { Metadata } from 'next'
import { getLocaleParams, getMetadataTranslator } from '~/lib/i18n/web-i18n'
import { withLocale } from '~/lib/i18n/config'
import { ProfileEditPanel } from '~/features/profile/components/profile-edit'
import { requireAuthenticatedPage } from '~/lib/auth/session'
import { getRequiredPageData } from '~/lib/api/page-data'
import { getProfile } from '~/lib/api/profile/profile.request'
import { AppShell } from '~/features/common/components/app-shell'

type ProfilePageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { t } = await getMetadataTranslator(params, 'profile')

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await getLocaleParams(params)

  await requireAuthenticatedPage(locale)

  const profile = await getRequiredPageData(() => getProfile(locale), {
    context: `profile.page`,
    notFoundStatuses: [403, 404],
    unauthorizedRedirectTo: withLocale(locale, '/login'),
  })

  return (
    <AppShell active="profile">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <ProfileEditPanel initialProfile={profile} />
      </div>
    </AppShell>
  )
}
