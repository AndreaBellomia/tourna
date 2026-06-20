import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@repo/ui/button'
import { getRequiredPageData } from '~/lib/api/page-data'
import { getTeam } from '~/lib/api/teams/team.request'
import { requireAuthenticatedPage } from '~/lib/auth/session'
import { isLocale, resolveLocale, withLocale } from '~/lib/i18n/config'
import { getMessages } from '~/lib/i18n/web-i18n'
import { AppShell } from '~/features/common/components/app-shell'
import { TeamEditPanel } from '~/features/teams/components/team-edit-panel'

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

  return (
    <AppShell active="teams" locale={locale} messages={messages.common}>
      <div className="mx-auto mb-5 w-full max-w-6xl">
        <Link
          className={buttonVariants({ variant: 'outline' })}
          href={withLocale(locale, `/teams/${id}`)}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {messages.teams.detail.back}
        </Link>
      </div>
      <TeamEditPanel locale={locale} messages={messages.teams} />
    </AppShell>
  )
}
