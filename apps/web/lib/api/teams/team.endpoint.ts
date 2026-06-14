import type { TeamListQuery } from '@repo/contracts'

export const teamEndpoints = {
  list: '/teams',
  detail: (teamId: string) => `/teams/${teamId}`,
  create: '/teams',
  join: (teamId: string) => `/teams/${teamId}/join`,
  leave: (teamId: string) => `/teams/${teamId}/leave`,
  invitations: (teamId: string) => `/teams/${teamId}/invitations`,
  acceptInvitation: (code: string) => `/teams/invitations/${encodeURIComponent(code)}/accept`,
  remove: (teamId: string) => `/teams/${teamId}/remove`,
} as const

export function teamListEndpoint(query: Partial<TeamListQuery> = {}) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  }

  const search = params.toString()

  return search ? `${teamEndpoints.list}?${search}` : teamEndpoints.list
}
