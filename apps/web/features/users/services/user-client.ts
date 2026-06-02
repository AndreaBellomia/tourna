'use client'

import {
  UserDetailResponseSchema,
  UserListResponseSchema,
  type UserListQuery,
} from '@repo/contracts'
import { clientApiRequest } from '../../common/services/client-api'

export type ClientUserListQuery = Partial<UserListQuery>

export function fetchUsers(query: ClientUserListQuery = {}) {
  return clientApiRequest({
    path: '/api/users',
    schema: UserListResponseSchema,
    query,
    fallbackErrorMessage: 'Unable to load users',
  })
}

export function fetchUser(userId: string) {
  return clientApiRequest({
    path: `/api/users/${userId}`,
    schema: UserDetailResponseSchema,
    fallbackErrorMessage: 'Unable to load user',
  })
}
