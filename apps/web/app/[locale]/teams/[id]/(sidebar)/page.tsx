import type { Metadata } from 'next'
import { getOptionalPageData, getRequiredPageData } from '~/lib/api/page-data'
import { getTeam } from '~/lib/api/teams/team.request'
import { getLocaleParams, getMetadataTranslator, getWebTranslator } from '~/lib/i18n/web-i18n'
import { TeamProfile } from '~/features/teams/components/team-profile'

type TeamPageProps = {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
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

export default async function TeamPage({ params }: TeamPageProps) {
  const { locale, params: { id } } = await getLocaleParams(params)

  const team = await getRequiredPageData(() => getTeam(id, locale), {
    context: `teams.detail.page:${id}`,
    notFoundStatuses: [403, 404],
  })

  return <TeamProfile team={team} />
}
