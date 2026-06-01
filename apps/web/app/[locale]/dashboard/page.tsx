import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { CalendarDays, RadioTower, ShieldCheck, Trophy } from 'lucide-react'
import { Badge } from '@repo/ui/badge'
import { Button } from '@repo/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card'
import { authCookieNames } from '../../../lib/auth/cookies'
import { logout as revokeSession } from '../../../lib/api/auth/auth.request'
import { requireAuthenticatedPage } from '../../../lib/auth/session'
import { isLocale, resolveLocale, type Locale, withLocale } from '../../../lib/i18n/config'
import { getMessages } from '../../../lib/i18n/web-i18n'

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

  const cookieStore = await cookies()
  const sessionId = cookieStore.get(authCookieNames.sessionId)?.value
  const stats = [
    { label: messages.dashboard.stats.tournaments, value: '0', icon: Trophy },
    { label: messages.dashboard.stats.liveMatches, value: '0', icon: RadioTower },
    { label: messages.dashboard.stats.session, value: 'OK', icon: ShieldCheck },
  ]

  return (
    <main className="min-h-screen bg-background px-5 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Trophy aria-hidden="true" className="size-5" />
              </div>
              <div>
                <p className="text-xl font-semibold leading-none">{messages.metadata.appName}</p>
                <p className="mt-1 text-sm text-muted-foreground">{messages.dashboard.product}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
              href={withLocale(locale, '/teams')}
            >
              {messages.teams.nav.teams}
            </Link>
            <form action={logout.bind(null, locale)}>
              <Button type="submit" variant="outline">
                {messages.dashboard.logout}
              </Button>
            </form>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <Card key={stat.label}>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold">{stat.value}</p>
                </CardContent>
              </Card>
            )
          })}
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge variant="secondary" className="mb-3 gap-1.5">
                <CalendarDays aria-hidden="true" className="size-3.5" />
                {messages.dashboard.setupBadge}
              </Badge>
              <h1 className="text-2xl font-semibold tracking-normal">{messages.dashboard.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {messages.dashboard.description}
              </p>
            </div>
            <p className="rounded-md border border-border bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
              {sessionId ? `session:${sessionId.slice(0, 8)}` : messages.dashboard.sessionFallback}
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

async function logout(locale: Locale) {
  'use server'

  const cookieStore = await cookies()
  const accessToken = cookieStore.get(authCookieNames.accessToken)?.value

  if (accessToken) {
    try {
      await revokeSession(accessToken)
    } catch {
      // Best-effort: clear cookies even if backend revocation fails
    }
  }

  cookieStore.delete(authCookieNames.accessToken)
  cookieStore.delete(authCookieNames.refreshToken)
  cookieStore.delete(authCookieNames.sessionId)

  redirect(withLocale(locale, '/login'))
}
