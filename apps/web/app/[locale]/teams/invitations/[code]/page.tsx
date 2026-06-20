import type { Metadata } from 'next'
import { TeamInvitationAccept } from '~/features/teams/components/team-invitation-accept'
import { getLocaleParams, getMetadataTranslator } from '~/lib/i18n/web-i18n'

type TeamInvitationPageProps = {
  params: Promise<{ code: string; locale: string }>
}

export async function generateMetadata({ params }: TeamInvitationPageProps): Promise<Metadata> {
  const { t } = await getMetadataTranslator(params, 'teams')

  return {
    title: t('inviteAccept.metadataTitle'),
    description: t('inviteAccept.description'),
  }
}

export default async function TeamInvitationPage({ params }: TeamInvitationPageProps) {
  const { params: { code } } = await getLocaleParams(params)

  return (
    <main className="min-h-screen bg-background">
      <TeamInvitationAccept code={code} />
    </main>
  )
}
