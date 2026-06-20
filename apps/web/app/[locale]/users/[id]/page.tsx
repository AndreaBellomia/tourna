import type { Metadata } from 'next'
import { getOptionalPageData, getRequiredPageData } from '~/lib/api/page-data'
import { getUser } from '~/lib/api/users/user.request'
import { getLocaleParams, getMetadataTranslator, getWebTranslator } from '~/lib/i18n/web-i18n'
import { UserProfile } from '~/features/users/components/user-profile'

type UserPageProps = {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { locale, params: { id }, t } = await getMetadataTranslator(params, 'users')
  const tMetadata = await getWebTranslator(locale, 'metadata')
  const user = await getOptionalPageData(() => getUser(id, locale), null, {
    context: `users.detail.metadata:${id}`,
  })

  return {
    title: user
      ? `${user.display_name} | ${tMetadata('appName')}`
      : t('metadata.title'),
    description: user?.bio ?? t('metadata.description'),
  }
}

export default async function UserPage({ params }: UserPageProps) {
  const { locale, params: { id } } = await getLocaleParams(params)
  const user = await getRequiredPageData(() => getUser(id, locale), {
    context: `users.detail.page:${id}`,
    notFoundStatuses: [403, 404],
  })

  return (
    <main className="min-h-screen bg-background px-5 py-6 md:px-8">
      <UserProfile initialUser={user} />
    </main>
  )
}
