'use client'

import { buttonVariants } from '@repo/ui/button'
import { Pencil, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { SettingsSection } from '~/features/common/components/settings-section'
import { withLocale } from '~/lib/i18n/config'
import { useI18n, useTranslations } from '~/lib/i18n/client'
import { useTeam } from '../hooks/team-provider'

export function TeamSettings() {
  const { locale } = useI18n()
  const t = useTranslations('teams')
  const { team } = useTeam()

  return (
    <section className="space-y-4">
      <SettingsSection
        title={t('detail.editTitle')}
        description={t('detail.editDescription')}
        actions={
          <Link
            className={buttonVariants({ variant: 'outline' })}
            href={withLocale(locale, `/teams/${team.slug}/edit`)}
          >
            <Pencil aria-hidden="true" className="size-4" />
            {t('detail.editTitle')}
          </Link>
        }
      >
        <p className="text-sm leading-6 text-muted-foreground">
          {t('settings.profileDescription')}
        </p>
      </SettingsSection>

      <SettingsSection
        title={t('detail.permissionsTitle')}
        description={t('detail.permissionsDescription')}
      >
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="size-4 text-accent" />
          {t('detail.disabledAction')}
        </div>
      </SettingsSection>
    </section>
  )
}
