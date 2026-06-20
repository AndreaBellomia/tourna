'use client'

import { buttonVariants } from '@repo/ui/button'
import { Pencil, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { SettingsSection } from '~/features/common/components/settings-section'
import { Locale, withLocale } from '~/lib/i18n/config'
import { Messages } from '~/lib/i18n/web-i18n'
import { useTeam } from '../hooks/team-provider'

type TeamSettingsProps = {
  locale: Locale
  messages: Messages['teams']
}

export function TeamSettings({ locale, messages }: TeamSettingsProps) {
  const { team } = useTeam()

  return (
    <section className="space-y-4">
      <SettingsSection
        title={messages.detail.editTitle}
        description={messages.detail.editDescription}
        actions={
          <Link
            className={buttonVariants({ variant: 'outline' })}
            href={withLocale(locale, `/teams/${team.slug}/edit`)}
          >
            <Pencil aria-hidden="true" className="size-4" />
            {messages.detail.editTitle}
          </Link>
        }
      >
        <p className="text-sm leading-6 text-muted-foreground">
          {messages.settings.profileDescription}
        </p>
      </SettingsSection>

      <SettingsSection
        title={messages.detail.permissionsTitle}
        description={messages.detail.permissionsDescription}
      >
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="size-4 text-accent" />
          {messages.detail.disabledAction}
        </div>
      </SettingsSection>
    </section>
  )
}
