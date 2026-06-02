import {
  ProfileSummaryResponseSchema,
  UpdateProfileRequestSchema,
  type UpdateProfileInput,
} from '@repo/contracts/profile'
import { profileEndpoints } from './profile.endpoint'
import { apiRequest } from '../http'
import { authenticatedServerApiRequest } from '../auth/server-authenticated-request'

export function getProfile() {
  return authenticatedServerApiRequest(profileEndpoints.getProfile, ProfileSummaryResponseSchema, {
    cache: 'no-store',
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
