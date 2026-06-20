'use client'

import { TeamForm } from './team-form'
import { useTeam } from '../hooks/team-provider'

export function TeamEditPanel() {
  const { team } = useTeam()

  return <TeamForm mode="edit" team={team} />
}
