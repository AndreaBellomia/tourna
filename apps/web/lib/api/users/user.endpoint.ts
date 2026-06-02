import type { UserListQuery } from '@repo/contracts'

export const userEndpoints = {
  list: '/users',
  detail: (userId: string) => `/users/${userId}`,
} as const

export function userListEndpoint(query: Partial<UserListQuery> = {}) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  }

  const search = params.toString()

  return search ? `${userEndpoints.list}?${search}` : userEndpoints.list
}
