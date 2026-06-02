import {
  UserDetailResponseSchema,
  UserListResponseSchema,
  type UserListQuery,
} from '@repo/contracts'
import { apiRequest } from '../http'
import type { Locale } from '../../i18n/config'
import { userEndpoints, userListEndpoint } from './user.endpoint'

export function listUsers(query: Partial<UserListQuery> = {}, locale?: Locale) {
  return apiRequest(userListEndpoint(query), UserListResponseSchema, {
    cache: 'no-store',
    locale,
  })
}

export function getUser(userId: string, locale?: Locale) {
  return apiRequest(userEndpoints.detail(userId), UserDetailResponseSchema, {
    cache: 'no-store',
    locale,
  })
}
