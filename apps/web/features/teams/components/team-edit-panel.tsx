'use client'

import { useEffect, useState } from 'react'
import type { TeamDetailResponse } from '@repo/contracts'
import { type Locale } from '~/lib/i18n/config'
import type { Messages } from '~/lib/i18n/web-i18n'
import { fetchTeam } from '~/features/teams/services/team-client'
import { TeamForm } from './team-form'

type TeamEditPanelProps = {
  locale: Locale
  messages: Messages['teams']
  initialTeam: TeamDetailResponse
}

export function TeamEditPanel({ locale, messages, initialTeam }: TeamEditPanelProps) {
  const [team, setTeam] = useState(initialTeam)

  useEffect(() => {
    let active = true

    void fetchTeam(initialTeam.id)
      .then((freshTeam) => {
        if (active) setTeam(freshTeam)
      })
      .catch(() => {
        // The form stays disabled when the role-aware load fails.
      })

    return () => {
      active = false
    }
  }, [initialTeam.id])

  return <TeamForm locale={locale} messages={messages} mode="edit" team={team} />
}
