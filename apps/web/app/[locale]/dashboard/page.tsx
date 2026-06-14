import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import {
  CalendarDays,
  Inbox,
  Plus,
  RadioTower,
  ShieldCheck,
  Trophy,
  UserCircle,
} from 'lucide-react'
import { Badge } from '@repo/ui/badge'
import { buttonVariants } from '@repo/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card'
import { AppShell } from '~/features/common/components/app-shell'
import { EmptyState } from '~/features/common/components/empty-state'
import { PageHeader } from '~/features/common/components/page-header'
import { requireAuthenticatedPage } from '~/lib/auth/session'
import { isLocale, resolveLocale, withLocale } from '~/lib/i18n/config'
import { getMessages } from '~/lib/i18n/web-i18n'

type DashboardPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: DashboardPageProps): Promise<Metadata> {
  const { locale } = await params
  const messages = getMessages(resolveLocale(locale))

  return {
    title: messages.metadata.dashboardTitle,
    description: messages.metadata.dashboardDescription,
  }
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const messages = getMessages(locale)
  await requireAuthenticatedPage(locale)

  const stats = [
    { label: messages.dashboard.stats.tournaments, value: '0', icon: Trophy },
    { label: messages.dashboard.stats.liveMatches, value: '0', icon: RadioTower },
    { label: messages.dashboard.stats.session, value: 'OK', icon: ShieldCheck },
  ]

  return (
    <AppShell active="dashboard" locale={locale} messages={messages.common}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <PageHeader
          badgeIcon={<CalendarDays aria-hidden="true" className="size-3.5" />}
          description={messages.dashboard.description}
          eyebrow={messages.dashboard.setupBadge}
          title={messages.dashboard.title}
          actions={
            <>
              <Link className={buttonVariants()} href={withLocale(locale, '/teams/new')}>
                <Plus aria-hidden="true" className="size-4" />
                {messages.common.shell.createTeam}
              </Link>
              <Link
                className={buttonVariants({ variant: 'outline' })}
                href={withLocale(locale, '/profile')}
              >
                <UserCircle aria-hidden="true" className="size-4" />
                {messages.common.nav.profile}
              </Link>
            </>
          }
        />

        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <Card key={stat.label} variant="panel">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon aria-hidden="true" className="size-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold">{stat.value}</p>
                </CardContent>
              </Card>
            )
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <ShortcutCard
              description={messages.dashboard.shortcuts.teams}
              href={withLocale(locale, '/teams')}
              icon={<Trophy aria-hidden="true" className="size-4" />}
              title={messages.common.nav.teams}
            />
            <ShortcutCard
              description={messages.dashboard.shortcuts.users}
              href={withLocale(locale, '/users')}
              icon={<UserCircle aria-hidden="true" className="size-4" />}
              title={messages.common.nav.users}
            />
            <ShortcutCard
              description={messages.dashboard.shortcuts.settings}
              href={withLocale(locale, '/profile')}
              icon={<ShieldCheck aria-hidden="true" className="size-4" />}
              title={messages.common.nav.settings}
            />
            <Card className="p-5" variant="muted">
              <div className="flex items-center gap-2">
                <RadioTower aria-hidden="true" className="size-4 text-muted-foreground" />
                <h2 className="font-semibold">{messages.common.nav.tournaments}</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {messages.dashboard.shortcuts.tournaments}
              </p>
              <Badge className="mt-4" variant="outline">
                {messages.common.shell.tournamentsSoon}
              </Badge>
            </Card>
          </div>

          <EmptyState
            title={messages.dashboard.invitations.emptyTitle}
            description={messages.dashboard.invitations.emptyDescription}
            action={
              <Link
                className={buttonVariants({ variant: 'outline' })}
                href={withLocale(locale, '/teams')}
              >
                <Inbox aria-hidden="true" className="size-4" />
                {messages.dashboard.invitations.browseTeams}
              </Link>
            }
          />
        </section>
      </div>
    </AppShell>
  )
}

function ShortcutCard({
  description,
  href,
  icon,
  title,
}: {
  description: string
  href: string
  icon: ReactNode
  title: string
}) {
  return (
    <Link
      className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-muted/40"
      href={href}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-md bg-muted text-primary">
          {icon}
        </span>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
    </Link>
  )
}
