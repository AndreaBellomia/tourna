import { TeamSettings } from '~/features/teams/components/team-settings'
import { getOptionalPageData } from '~/lib/api/page-data'
import { getTeam } from '~/lib/api/teams/team.request'
import { getLocaleParams, getMetadataTranslator, getWebTranslator } from '~/lib/i18n/web-i18n'

type TeamSettingsProps = {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: TeamSettingsProps) {
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

export default async function TeamSettingsPage({ params }: TeamSettingsProps) {
  await getLocaleParams(params)

  return <TeamSettings />
}
