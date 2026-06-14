import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@repo/ui/button'
import { isLocale, resolveLocale, withLocale } from '~/lib/i18n/config'
import { getMessages } from '~/lib/i18n/web-i18n'
import { requireAuthenticatedPage } from '~/lib/auth/session'
import { AppShell } from '~/features/common/components/app-shell'
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
    <AppShell active="teams" locale={locale} messages={messages.common}>
      <div className="mx-auto mb-5 w-full max-w-6xl">
        <Link
          className={buttonVariants({ variant: 'outline' })}
          href={withLocale(locale, '/teams')}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {messages.teams.detail.back}
        </Link>
      </div>
      <TeamForm locale={locale} messages={messages.teams} mode="create" />
    </AppShell>
  )
}
