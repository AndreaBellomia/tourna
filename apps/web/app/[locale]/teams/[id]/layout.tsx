import { TeamProvider } from '~/features/teams/hooks/team-provider'
import { getRequiredPageData } from '~/lib/api/page-data'
import { getTeam } from '~/lib/api/teams/team.request'
import { getLocaleParams } from '~/lib/i18n/web-i18n'

type TeamRootLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string; id: string }>
}

export default async function TeamRootLayout({ children, params }: Readonly<TeamRootLayoutProps>) {
  const { locale, params: { id } } = await getLocaleParams(params)

  const team = await getRequiredPageData(() => getTeam(id, locale), {
    context: `teams.detail.page:${id}`,
    notFoundStatuses: [403, 404],
  })

  return <TeamProvider initialTeam={team}>{children}</TeamProvider>
}
