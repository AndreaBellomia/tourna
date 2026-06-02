import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getOptionalPageData } from '../../../lib/api/page-data'
import { listTeams } from '../../../lib/api/teams/team.request'
import { isLocale, resolveLocale } from '../../../lib/i18n/config'
import { getMessages } from '../../../lib/i18n/web-i18n'
import { AppHeader } from '../../../features/common/components/app-header'
import { TeamExplorer } from '../../../features/teams/components/team-explorer'

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
    () => listTeams({ limit: 12, direction: 'next' }),
    null,
    { context: 'teams.list.initialPage' },
  )

  return (
    <main className="min-h-screen bg-background px-5 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <AppHeader active="teams" locale={locale} messages={messages.common} />

        <TeamExplorer
          initialError={initialPage ? undefined : messages.teams.list.unavailable}
          initialPage={initialPage}
          locale={locale}
          messages={messages.teams}
        />
      </div>
    </main>
  )
}
