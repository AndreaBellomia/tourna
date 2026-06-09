import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getOptionalPageData, getRequiredPageData } from '~/lib/api/page-data'
import { getTeam } from '~/lib/api/teams/team.request'
import { isLocale, resolveLocale } from '~/lib/i18n/config'
import { getMessages } from '~/lib/i18n/web-i18n'
import { TeamProfile } from '~/features/teams/components/team-profile'

type TeamPageProps = {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { locale, id } = await params
  const messages = getMessages(resolveLocale(locale))
  const team = await getOptionalPageData(() => getTeam(id, resolveLocale(locale)), null, {
    context: `teams.detail.metadata:${id}`,
  })

  return {
    title: team ? `${team.name} | ${messages.metadata.appName}` : messages.teams.metadata.title,
    description: team?.description ?? messages.teams.metadata.description,
  }
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { locale, id } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const messages = getMessages(locale)
  const team = await getRequiredPageData(() => getTeam(id, locale), {
    context: `teams.detail.page:${id}`,
    notFoundStatuses: [403, 404],
  })

  return (
    <main className="min-h-screen bg-background px-5 py-6 md:px-8">
      <TeamProfile initialTeam={team} locale={locale} messages={messages.teams} />
    </main>
  )
}
