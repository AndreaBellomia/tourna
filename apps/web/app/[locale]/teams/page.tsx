import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { Trophy } from 'lucide-react'
import { authCookieNames } from '../../../lib/auth/cookies'
import { listTeams } from '../../../lib/api/teams/team.request'
import { isLocale, resolveLocale, withLocale } from '../../../lib/i18n/config'
import { getMessages } from '../../../lib/i18n/web-i18n'
import { TeamExplorer } from '../../../features/teams/components/team-explorer'

type TeamsPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: TeamsPageProps): Promise<Metadata> {
  const { locale } = await params
  const messages = getMessages(resolveLocale(locale))

  return {
    title: messages.teams.metadata.title,
    description: messages.teams.metadata.description,
  }
}

export default async function TeamsPage({ params }: TeamsPageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const cookieStore = await cookies()

  if (!cookieStore.has(authCookieNames.accessToken)) {
    redirect(withLocale(locale, '/login'))
  }

  const messages = getMessages(locale)
  const initialPage = await listTeams({ limit: 12, direction: 'next' }).catch(() => null)

  return (
    <main className="min-h-screen bg-background px-5 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Trophy aria-hidden="true" className="size-5" />
            </div>
            <div>
              <p className="text-xl font-semibold leading-none">{messages.metadata.appName}</p>
              <p className="mt-1 text-sm text-muted-foreground">{messages.dashboard.product}</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-10 items-center justify-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground">
              {messages.teams.nav.teams}
            </span>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
              href={withLocale(locale, '/dashboard')}
            >
              {messages.teams.nav.dashboard}
            </Link>
          </nav>
        </header>

        <TeamExplorer
          initialError={initialPage ? undefined : messages.teams.list.unavailable}
          initialPage={initialPage}
          locale={locale}
          messages={messages.teams}
        />
      </div>
    </main>
  )
}
