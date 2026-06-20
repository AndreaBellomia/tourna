'use client'

import { useState } from 'react'
import { MailPlus } from 'lucide-react'
import { useTranslations } from '~/lib/i18n/client'
import { TeamInvitationPanel } from './team-invitation-panel'
import { useTeam } from '../hooks/team-provider'
import { PageHeader } from '~/features/common/components/page-header'
import { TeamInvitationModalForm } from './team-invitation-modal-form'

export function TeamInvitations() {
  const t = useTranslations('teams')
  const { team, canManage } = useTeam()
  const [refreshToken, setRefreshToken] = useState(0)

  return (
    <section className="space-y-5">
      <PageHeader
        badgeIcon={<MailPlus aria-hidden="true" className="size-3.5" />}
        description={t('invites.description')}
        eyebrow={t('invites.eyebrow')}
        title={t('invites.title')}
        actions={
          canManage ? (
            <TeamInvitationModalForm
              team={team}
              onInvitationCreated={() => setRefreshToken((current) => current + 1)}
            />
          ) : null
        }
      />
      <TeamInvitationPanel refreshToken={refreshToken} team={team} />
    </section>
  )
}
