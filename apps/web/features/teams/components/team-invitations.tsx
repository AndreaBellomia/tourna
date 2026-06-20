'use client'

import { MailPlus } from 'lucide-react'
import { useTranslations } from '~/lib/i18n/client'
import { TeamInvitationPanel } from './team-invitation-panel'
import { useTeam } from '../hooks/team-provider'
import { Card, CardDescription, CardHeader, CardTitle } from '@repo/ui/card'

export function TeamInvitations() {
  const t = useTranslations('teams')
  const { team } = useTeam()

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <MailPlus aria-hidden="true" className="size-4" />
            {t('invites.title')}
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {t('invites.description')}
          </p>
        </div>
        <TeamInvitationPanel team={team} />
      </div>

      <Card variant="muted">
        <CardHeader>
          <CardTitle className="text-base">{t('invites.statusTitle')}</CardTitle>
          <CardDescription>{t('invites.statusDescription')}</CardDescription>
        </CardHeader>
      </Card>
    </section>
  )
}
