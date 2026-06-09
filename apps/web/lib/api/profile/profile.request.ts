import {
  ProfileSummaryResponseSchema,
  UpdateProfileRequestSchema,
  type UpdateProfileInput,
} from '@repo/contracts/profile'
import { profileEndpoints } from './profile.endpoint'
import { apiRequest } from '~/lib/api/http'
import { authenticatedServerApiRequest } from '~/lib/api/auth/server-authenticated-request'
import type { Locale } from '~/lib/i18n/config'

export function getProfile(locale?: Locale) {
  return authenticatedServerApiRequest(profileEndpoints.getProfile, ProfileSummaryResponseSchema, {
    cache: 'no-store',
    locale,
  })
}

export function updateProfile(payload: UpdateProfileInput, accessToken: string) {
  const body = UpdateProfileRequestSchema.parse(payload)

  return apiRequest(profileEndpoints.updateProfile, ProfileSummaryResponseSchema, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body,
    cache: 'no-store',
  })
}
