import {
  UserDetailResponseSchema,
  UserListResponseSchema,
  type UserListQuery,
} from '@repo/contracts'
import { apiRequest } from '../http'
import { userEndpoints, userListEndpoint } from './user.endpoint'

export function listUsers(query: Partial<UserListQuery> = {}) {
  return apiRequest(userListEndpoint(query), UserListResponseSchema, {
    cache: 'no-store',
  })
}

export function getUser(userId: string) {
  return apiRequest(userEndpoints.detail(userId), UserDetailResponseSchema, {
    cache: 'no-store',
  })
}
