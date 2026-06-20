import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@repo/ui/components/button'
import { requireAuthenticatedPage } from '~/lib/auth/session'
import { withLocale } from '~/lib/i18n/config'
import { getMetadataTranslator, getPageI18n } from '~/lib/i18n/web-i18n'
import { AppShell } from '~/features/common/components/app-shell'
import { TeamEditPanel } from '~/features/teams/components/team-edit-panel'

type EditTeamPageProps = {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: EditTeamPageProps): Promise<Metadata> {
  const { t } = await getMetadataTranslator(params, 'teams')

  return {
    title: t('detail.editTitle'),
    description: t('metadata.description'),
  }
}

export default async function EditTeamPage({ params }: EditTeamPageProps) {
  const { locale, params: { id }, messages } = await getPageI18n(params)

  await requireAuthenticatedPage(locale)

  return (
    <AppShell active="teams">
      <div className="mx-auto mb-5 w-full max-w-6xl">
        <Link
          className={buttonVariants({ variant: 'outline' })}
          href={withLocale(locale, `/teams/${id}`)}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {messages.teams.detail.back}
        </Link>
      </div>
      <TeamEditPanel />
    </AppShell>
  )
}
