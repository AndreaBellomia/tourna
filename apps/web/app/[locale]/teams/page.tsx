import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getOptionalPageData } from '~/lib/api/page-data'
import { listTeams } from '~/lib/api/teams/team.request'
import { isLocale, resolveLocale } from '~/lib/i18n/config'
import { getMessages } from '~/lib/i18n/web-i18n'
import { AppShell } from '~/features/common/components/app-shell'
import { TeamExplorer } from '~/features/teams/components/team-explorer'

type TeamsPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: TeamsPageProps): Promise<Metadata> {
  const { locale } = await params
  const messages = getMessages(resolveLocale(locale))

  return {
    title: messages.teams.metadata.title,
    description: messages.teams.metadata.description,
  }
}

export default async function TeamsPage({ params }: TeamsPageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const messages = getMessages(locale)
  const initialPage = await getOptionalPageData(
    () => listTeams({ limit: 12, direction: 'next' }, locale),
    null,
    { context: 'teams.list.initialPage' },
  )

  return (
    <AppShell active="teams" locale={locale} messages={messages.common}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <TeamExplorer
          initialError={initialPage ? undefined : messages.teams.list.unavailable}
          initialPage={initialPage}
          locale={locale}
          messages={messages.teams}
        />
      </div>
    </AppShell>
  )
}
