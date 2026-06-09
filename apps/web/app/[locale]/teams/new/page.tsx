import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { isLocale, resolveLocale, withLocale } from '~/lib/i18n/config'
import { getMessages } from '~/lib/i18n/web-i18n'
import { requireAuthenticatedPage } from '~/lib/auth/session'
import { TeamForm } from '~/features/teams/components/team-form'

type NewTeamPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: NewTeamPageProps): Promise<Metadata> {
  const { locale } = await params
  const messages = getMessages(resolveLocale(locale))

  return {
    title: messages.teams.form.title,
    description: messages.teams.metadata.description,
  }
}

export default async function NewTeamPage({ params }: NewTeamPageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  await requireAuthenticatedPage(locale)

  const messages = getMessages(locale)

  return (
    <main className="min-h-screen bg-background px-5 py-6 md:px-8">
      <div className="mx-auto mb-5 w-full max-w-6xl">
        <Link
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
          href={withLocale(locale, '/teams')}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {messages.teams.detail.back}
        </Link>
      </div>
      <TeamForm locale={locale} messages={messages.teams} mode="create" />
    </main>
  )
}
