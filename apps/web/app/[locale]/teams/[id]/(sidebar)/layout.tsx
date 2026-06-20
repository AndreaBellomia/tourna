import { AppShell } from '~/features/common/components/app-shell'
import { TeamSidebar } from '~/features/teams/components/team-sidebar'
import { getLocaleParams } from '~/lib/i18n/web-i18n'

type TeamSidebarLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string; id: string }>
}

export default async function TeamSidebarLayout({
  children,
  params,
}: Readonly<TeamSidebarLayoutProps>) {
  await getLocaleParams(params)

  return (
    <AppShell active="teams">
      <TeamSidebar>{children}</TeamSidebar>
    </AppShell>
  )
}
