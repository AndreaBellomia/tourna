import type { Metadata } from 'next'
import { getOptionalPageData } from '~/lib/api/page-data'
import { listUsers } from '~/lib/api/users/user.request'
import { getLocaleParams, getMetadataTranslator } from '~/lib/i18n/web-i18n'
import { AppShell } from '~/features/common/components/app-shell'
import { UserExplorer } from '~/features/users/components/user-explorer'

type UsersPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: UsersPageProps): Promise<Metadata> {
  const { t } = await getMetadataTranslator(params, 'users')

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

export default async function UsersPage({ params }: UsersPageProps) {
  const { locale } = await getLocaleParams(params)
  const initialPage = await getOptionalPageData(
    () => listUsers({ limit: 12, direction: 'next' }, locale),
    null,
    { context: 'users.list.initialPage' },
  )

  return (
    <AppShell active="users">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <UserExplorer
          initialPage={initialPage}
        />
      </div>
    </AppShell>
  )
}
