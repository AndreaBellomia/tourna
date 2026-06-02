import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getOptionalPageData } from '../../../lib/api/page-data'
import { listUsers } from '../../../lib/api/users/user.request'
import { isLocale, resolveLocale } from '../../../lib/i18n/config'
import { getMessages } from '../../../lib/i18n/web-i18n'
import { AppHeader } from '../../../features/common/components/app-header'
import { UserExplorer } from '../../../features/users/components/user-explorer'

type UsersPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: UsersPageProps): Promise<Metadata> {
  const { locale } = await params
  const messages = getMessages(resolveLocale(locale))

  return {
    title: messages.users.metadata.title,
    description: messages.users.metadata.description,
  }
}

export default async function UsersPage({ params }: UsersPageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const messages = getMessages(locale)
  const initialPage = await getOptionalPageData(
    () => listUsers({ limit: 12, direction: 'next' }),
    null,
    { context: 'users.list.initialPage' },
  )

  return (
    <main className="min-h-screen bg-background px-5 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <AppHeader active="users" locale={locale} messages={messages.common} />
        <UserExplorer
          initialError={initialPage ? undefined : messages.users.list.unavailable}
          initialPage={initialPage}
          locale={locale}
          messages={messages.users}
        />
      </div>
    </main>
  )
}
