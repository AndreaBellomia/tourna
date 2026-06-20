import { notFound } from 'next/navigation'
import { TeamInvitations } from '~/features/teams/components/team-invitations'
import { getOptionalPageData } from '~/lib/api/page-data'
import { getTeam } from '~/lib/api/teams/team.request'
import { isLocale, resolveLocale } from '~/lib/i18n/config'
import { getMessages } from '~/lib/i18n/web-i18n'

type TeamInvitationsProps = {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: TeamInvitationsProps) {
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

export default async function TeamInvitationsPage({ params }: TeamInvitationsProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const messages = getMessages(locale)

  return <TeamInvitations locale={locale} messages={messages.teams} />
}
