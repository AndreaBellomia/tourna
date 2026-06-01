'use client'

import {
  CreateTeamRequestSchema,
  TeamDetailResponseSchema,
  TeamListResponseSchema,
  type CreateTeamInput,
  type TeamListQuery,
} from '@repo/contracts'
import { z } from 'zod'

export type ClientTeamListQuery = Partial<TeamListQuery>

export async function fetchTeams(query: ClientTeamListQuery = {}) {
  const response = await fetch(`/api/teams?${createSearchParams(query)}`, {
    headers: { Accept: 'application/json' },
  })
  const payload: unknown = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(readErrorMessage(payload, 'Unable to load teams'))
  }

  return TeamListResponseSchema.parse(payload)
}

export async function submitTeam(values: CreateTeamInput) {
  const payload = CreateTeamRequestSchema.parse(values)
  const response = await fetch('/api/teams', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const data: unknown = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(readErrorMessage(data, 'Unable to create team'))
  }

  return TeamDetailResponseSchema.parse(data)
}

export function readZodFieldErrors(error: unknown): Record<string, string[] | undefined> {
  if (error instanceof z.ZodError) {
    return z.flattenError(error).fieldErrors
  }

  return {}
}

function createSearchParams(query: ClientTeamListQuery) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  }

  return params.toString()
}

function readErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = payload.message

    if (typeof message === 'string') return message
  }

  return fallback
}
