import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TeamInvitationAccept } from '~/features/teams/components/team-invitation-accept'
import { isLocale, resolveLocale } from '~/lib/i18n/config'
import { getMessages } from '~/lib/i18n/web-i18n'

type TeamInvitationPageProps = {
  params: Promise<{ code: string; locale: string }>
}

export async function generateMetadata({ params }: TeamInvitationPageProps): Promise<Metadata> {
  const { locale } = await params
  const messages = getMessages(resolveLocale(locale))

  return {
    title: messages.teams.inviteAccept.metadataTitle,
    description: messages.teams.inviteAccept.description,
  }
}

export default async function TeamInvitationPage({ params }: TeamInvitationPageProps) {
  const { code, locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const messages = getMessages(locale)

  return (
    <main className="min-h-screen bg-background">
      <TeamInvitationAccept code={code} locale={locale} messages={messages.teams.inviteAccept} />
    </main>
  )
}
