'use client'

import { MailPlus } from 'lucide-react'
import { Locale } from '~/lib/i18n/config'
import { Messages } from '~/lib/i18n/web-i18n'
import { TeamInvitationPanel } from './team-invitation-panel'
import { useTeam } from '../hooks/team-provider'
import { Card, CardDescription, CardHeader, CardTitle } from '@repo/ui/card'

type TeamMembersProps = {
  locale: Locale
  messages: Messages['teams']
}

export function TeamInvitations({ locale, messages }: TeamMembersProps) {
  const { team } = useTeam()

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <MailPlus aria-hidden="true" className="size-4" />
            {messages.invites.title}
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {messages.invites.description}
          </p>
        </div>
        <TeamInvitationPanel locale={locale} messages={messages.invites} team={team} />
      </div>

      <Card variant="muted">
        <CardHeader>
          <CardTitle className="text-base">{messages.invites.statusTitle}</CardTitle>
          <CardDescription>{messages.invites.statusDescription}</CardDescription>
        </CardHeader>
      </Card>
    </section>
  )
}
