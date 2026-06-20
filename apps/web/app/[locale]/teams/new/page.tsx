import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@repo/ui/components/button'
import { withLocale } from '~/lib/i18n/config'
import { getMetadataTranslator, getPageI18n } from '~/lib/i18n/web-i18n'
import { requireAuthenticatedPage } from '~/lib/auth/session'
import { AppShell } from '~/features/common/components/app-shell'
import { TeamForm } from '~/features/teams/components/team-form'

type NewTeamPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: NewTeamPageProps): Promise<Metadata> {
  const { t } = await getMetadataTranslator(params, 'teams')

  return {
    title: t('form.title'),
    description: t('metadata.description'),
  }
}

export default async function NewTeamPage({ params }: NewTeamPageProps) {
  const { locale, messages } = await getPageI18n(params)

  await requireAuthenticatedPage(locale)

  return (
    <AppShell active="teams">
      <div className="mx-auto mb-5 w-full max-w-6xl">
        <Link
          className={buttonVariants({ variant: 'outline' })}
          href={withLocale(locale, '/teams')}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {messages.teams.detail.back}
        </Link>
      </div>
      <TeamForm mode="create" />
    </AppShell>
  )
}
