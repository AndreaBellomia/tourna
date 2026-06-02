'use client'

import {
  CreatePresignedUploadSchema,
  FinalizeUploadSchema,
  ProfileSummaryResponseSchema,
  StorageObjectResponseSchema,
  UpdateProfileRequestSchema,
  type ProfileSummaryResponse,
  type UpdateProfileInput,
} from '@repo/contracts'
import { PresignedUploadResponseSchema } from '@repo/contracts/storage'
import { clientApiRequest } from '../../common/services/client-api'

export function updateProfile(values: UpdateProfileInput) {
  const payload = UpdateProfileRequestSchema.parse(values)

  return clientApiRequest({
    path: '/api/profile',
    schema: ProfileSummaryResponseSchema,
    method: 'PATCH',
    body: payload,
    fallbackErrorMessage: 'Unable to update profile',
  })
}

export async function uploadProfileAvatar(profile: ProfileSummaryResponse, file: File) {
  const presignPayload = CreatePresignedUploadSchema.parse({
    visibility: 'public',
    assetType: 'avatar',
    ownerScope: 'users',
    assetId: profile.id,
    filename: file.name,
    contentType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
  })
  const upload = await clientApiRequest({
    path: '/api/storage/uploads/presign',
    schema: PresignedUploadResponseSchema,
    method: 'POST',
    body: presignPayload,
    fallbackErrorMessage: 'Unable to prepare avatar upload',
  })

  const uploadResponse = await fetch(upload.url, {
    method: upload.method,
    headers: upload.headers,
    body: file,
  })

  if (!uploadResponse.ok) {
    throw new Error('Unable to upload avatar')
  }

  return clientApiRequest({
    path: '/api/storage/uploads/finalize',
    schema: StorageObjectResponseSchema,
    method: 'POST',
    body: FinalizeUploadSchema.parse({ uploadId: upload.uploadId }),
    fallbackErrorMessage: 'Unable to finalize avatar upload',
  })
}
