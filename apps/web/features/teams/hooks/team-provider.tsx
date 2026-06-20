'use client'

import { TeamDetailResponse } from '@repo/contracts'
import React from 'react'
import { useState } from 'react'

export const TeamContext = React.createContext<{
  team: TeamDetailResponse
  setTeam: React.Dispatch<React.SetStateAction<TeamDetailResponse>>
  canManage: boolean
} | null>(null)

export function TeamProvider({
  initialTeam,
  children,
}: Readonly<{
  initialTeam: TeamDetailResponse
  children: React.ReactNode
}>) {
  const [team, setTeam] = useState(initialTeam)

  const viewerMembership = team.viewerMembership
  const canManage = Boolean(viewerMembership?.canManage)

  return (
    <TeamContext.Provider value={{ team, setTeam, canManage }}>{children}</TeamContext.Provider>
  )
}

export function useTeam() {
  const context = React.useContext(TeamContext)

  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider')
  }

  return context
}
