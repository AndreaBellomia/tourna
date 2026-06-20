import { notFound } from 'next/navigation'
import { TeamMembers } from '~/features/teams/components/team-members'
import { getOptionalPageData } from '~/lib/api/page-data'
import { getTeam } from '~/lib/api/teams/team.request'
import { isLocale, resolveLocale } from '~/lib/i18n/config'
import { getMessages } from '~/lib/i18n/web-i18n'

type TeamPageProps = {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: TeamPageProps) {
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

export default async function TeamMembersPage({ params }: TeamPageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const messages = getMessages(locale)

  return <TeamMembers locale={locale} messages={messages.teams} />
}
