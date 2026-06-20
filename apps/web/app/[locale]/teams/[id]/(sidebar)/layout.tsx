import { notFound } from 'next/navigation'
import { AppShell } from '~/features/common/components/app-shell'
import { TeamSidebar } from '~/features/teams/components/team-sidebar'
import { isLocale, resolveLocale } from '~/lib/i18n/config'
import { getMessages } from '~/lib/i18n/web-i18n'

type TeamSidebarLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string; id: string }>
}

export default async function TeamSidebarLayout({
  children,
  params,
}: Readonly<TeamSidebarLayoutProps>) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const messages = getMessages(resolveLocale(locale))

  return (
    <AppShell active="teams" locale={locale} messages={messages.common}>
      <TeamSidebar locale={locale} messages={messages.teams}>
        {children}
      </TeamSidebar>
    </AppShell>
  )
}
