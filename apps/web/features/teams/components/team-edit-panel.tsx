'use client'

import { type Locale } from '~/lib/i18n/config'
import type { Messages } from '~/lib/i18n/web-i18n'
import { TeamForm } from './team-form'
import { useTeam } from '../hooks/team-provider'

type TeamEditPanelProps = {
  locale: Locale
  messages: Messages['teams']
}

export function TeamEditPanel({ locale, messages }: TeamEditPanelProps) {
  const { team } = useTeam()

  return <TeamForm locale={locale} messages={messages} mode="edit" team={team} />
}
