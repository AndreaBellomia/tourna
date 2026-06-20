import type { Metadata } from 'next'
import { getOptionalPageData } from '~/lib/api/page-data'
import { listTeams } from '~/lib/api/teams/team.request'
import { getLocaleParams, getMetadataTranslator } from '~/lib/i18n/web-i18n'
import { AppShell } from '~/features/common/components/app-shell'
import { TeamExplorer } from '~/features/teams/components/team-explorer'

type TeamsPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: TeamsPageProps): Promise<Metadata> {
  const { t } = await getMetadataTranslator(params, 'teams')

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

export default async function TeamsPage({ params }: TeamsPageProps) {
  const { locale } = await getLocaleParams(params)
  const initialPage = await getOptionalPageData(
    () => listTeams({ limit: 12, direction: 'next' }, locale),
    null,
    { context: 'teams.list.initialPage' },
  )

  return (
    <AppShell active="teams">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <TeamExplorer initialPage={initialPage} />
      </div>
    </AppShell>
  )
}
