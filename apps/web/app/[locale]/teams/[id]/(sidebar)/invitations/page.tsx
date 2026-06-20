import { TeamInvitations } from '~/features/teams/components/team-invitations'
import { getOptionalPageData } from '~/lib/api/page-data'
import { getTeam } from '~/lib/api/teams/team.request'
import { getLocaleParams, getMetadataTranslator, getWebTranslator } from '~/lib/i18n/web-i18n'

type TeamInvitationsProps = {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: TeamInvitationsProps) {
  const { locale, params: { id }, t } = await getMetadataTranslator(params, 'teams')
  const tMetadata = await getWebTranslator(locale, 'metadata')
  const team = await getOptionalPageData(() => getTeam(id, locale), null, {
    context: `teams.detail.metadata:${id}`,
  })

  return {
    title: team ? `${team.name} | ${tMetadata('appName')}` : t('metadata.title'),
    description: team?.description ?? t('metadata.description'),
  }
}

export default async function TeamInvitationsPage({ params }: TeamInvitationsProps) {
  await getLocaleParams(params)

  return <TeamInvitations />
}
