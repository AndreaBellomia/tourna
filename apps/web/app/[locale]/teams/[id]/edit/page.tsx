import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getRequiredPageData } from '../../../../../lib/api/page-data'
import { getTeam } from '../../../../../lib/api/teams/team.request'
import { requireAuthenticatedPage } from '../../../../../lib/auth/session'
import { isLocale, resolveLocale, withLocale } from '../../../../../lib/i18n/config'
import { getMessages } from '../../../../../lib/i18n/web-i18n'
import { TeamEditPanel } from '../../../../../features/teams/components/team-edit-panel'

type EditTeamPageProps = {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: EditTeamPageProps): Promise<Metadata> {
  const { locale } = await params
  const messages = getMessages(resolveLocale(locale))

  return {
    title: messages.teams.detail.editTitle,
    description: messages.teams.metadata.description,
  }
}

export default async function EditTeamPage({ params }: EditTeamPageProps) {
  const { locale, id } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  await requireAuthenticatedPage(locale)

  const messages = getMessages(locale)
  const team = await getRequiredPageData(() => getTeam(id), {
    context: `teams.edit.page:${id}`,
    notFoundStatuses: [403, 404],
    unauthorizedRedirectTo: withLocale(locale, '/login'),
  })

  return (
    <main className="min-h-screen bg-background px-5 py-6 md:px-8">
      <div className="mx-auto mb-5 w-full max-w-6xl">
        <Link
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
          href={withLocale(locale, `/teams/${id}`)}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {messages.teams.detail.back}
        </Link>
      </div>
      <TeamEditPanel initialTeam={team} locale={locale} messages={messages.teams} />
    </main>
  )
}
