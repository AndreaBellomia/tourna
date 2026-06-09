import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getOptionalPageData, getRequiredPageData } from '~/lib/api/page-data'
import { getUser } from '~/lib/api/users/user.request'
import { isLocale, resolveLocale } from '~/lib/i18n/config'
import { getMessages } from '~/lib/i18n/web-i18n'
import { UserProfile } from '~/features/users/components/user-profile'

type UserPageProps = {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { locale, id } = await params
  const messages = getMessages(resolveLocale(locale))
  const user = await getOptionalPageData(() => getUser(id, resolveLocale(locale)), null, {
    context: `users.detail.metadata:${id}`,
  })

  return {
    title: user
      ? `${user.display_name} | ${messages.metadata.appName}`
      : messages.users.metadata.title,
    description: user?.bio ?? messages.users.metadata.description,
  }
}

export default async function UserPage({ params }: UserPageProps) {
  const { locale, id } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const messages = getMessages(locale)
  const user = await getRequiredPageData(() => getUser(id, locale), {
    context: `users.detail.page:${id}`,
    notFoundStatuses: [403, 404],
  })

  return (
    <main className="min-h-screen bg-background px-5 py-6 md:px-8">
      <UserProfile initialUser={user} locale={locale} messages={messages.users} />
    </main>
  )
}
