'use client'

import { z } from 'zod'
import {
  CursorPaginationQuerySchema,
  CreatePresignedUploadSchema,
  CreateTeamRequestSchema,
  FinalizeUploadSchema,
  StorageObjectResponseSchema,
  TeamDetailResponseSchema,
  TeamInvitationAcceptResponseSchema,
  TeamInvitationListResponseSchema,
  TeamInvitationRequestSchema,
  TeamInvitationCreateResponseSchema,
  TeamListResponseSchema,
  type CursorPaginationQuery,
  UpdateTeamRequestSchema,
  type CreateTeamInput,
  type TeamDetailResponse,
  type TeamInvitationInput,
  type TeamListQuery,
  type UpdateTeamInput,
} from '@repo/contracts'
import { PresignedUploadResponseSchema } from '@repo/contracts/storage'
import { clientApiRequest } from '~/features/common/services/client-api'

export type ClientTeamListQuery = Partial<TeamListQuery>
export type ClientCursorPaginationQuery = Partial<CursorPaginationQuery>

export function fetchTeams(query: ClientTeamListQuery = {}) {
  return clientApiRequest({
    path: '/api/teams',
    schema: TeamListResponseSchema,
    query,
    fallbackErrorMessage: 'Unable to load teams',
  })
}

export function submitTeam(values: CreateTeamInput) {
  const payload = CreateTeamRequestSchema.parse(values)

  return clientApiRequest({
    path: '/api/teams',
    schema: TeamDetailResponseSchema,
    method: 'POST',
    body: payload,
    fallbackErrorMessage: 'Unable to create team',
  })
}

export function fetchTeam(teamId: string) {
  return clientApiRequest({
    path: `/api/teams/${teamId}`,
    schema: TeamDetailResponseSchema,
    fallbackErrorMessage: 'Unable to load team',
  })
}

export function updateTeam(teamId: string, values: UpdateTeamInput) {
  const payload = UpdateTeamRequestSchema.parse(values)

  return clientApiRequest({
    path: `/api/teams/${teamId}`,
    schema: TeamDetailResponseSchema,
    method: 'PATCH',
    body: payload,
    fallbackErrorMessage: 'Unable to update team',
  })
}

export function createTeamInvitation(teamId: string, values: TeamInvitationInput) {
  const payload = TeamInvitationRequestSchema.parse(values)

  return clientApiRequest({
    path: `/api/teams/${teamId}/invitations`,
    schema: TeamInvitationCreateResponseSchema,
    method: 'POST',
    body: payload,
    fallbackErrorMessage: 'Unable to create invitation',
  })
}

export function fetchTeamInvitations(teamId: string, query: ClientCursorPaginationQuery = {}) {
  return clientApiRequest({
    path: `/api/teams/${teamId}/invitations`,
    schema: TeamInvitationListResponseSchema,
    query: CursorPaginationQuerySchema.partial().parse(query),
    fallbackErrorMessage: 'Unable to load invitations',
  })
}

export function revokeTeamInvitation(teamId: string, invitationId: string) {
  return clientApiRequest({
    path: `/api/teams/${teamId}/invitations/${invitationId}/revoke`,
    schema: z.null(),
    method: 'POST',
    fallbackErrorMessage: 'Unable to revoke invitation',
  })
}

export function acceptTeamInvitation(code: string) {
  return clientApiRequest({
    path: `/api/team-invitations/${encodeURIComponent(code)}/accept`,
    schema: TeamInvitationAcceptResponseSchema,
    method: 'POST',
    fallbackErrorMessage: 'Unable to accept invitation',
  })
}

export async function uploadTeamLogo(team: Pick<TeamDetailResponse, 'id'>, file: File) {
  const presignPayload = CreatePresignedUploadSchema.parse({
    visibility: 'public',
    assetType: 'team_logo',
    ownerScope: 'teams',
    assetId: team.id,
    filename: file.name,
    contentType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
  })
  const upload = await clientApiRequest({
    path: '/api/storage/uploads/presign',
    schema: PresignedUploadResponseSchema,
    method: 'POST',
    body: presignPayload,
    fallbackErrorMessage: 'Unable to prepare logo upload',
  })

  const uploadResponse = await fetch(upload.url, {
    method: upload.method,
    headers: upload.headers,
    body: file,
  })

  if (!uploadResponse.ok) {
    throw new Error('Unable to upload logo')
  }

  return clientApiRequest({
    path: '/api/storage/uploads/finalize',
    schema: StorageObjectResponseSchema,
    method: 'POST',
    body: FinalizeUploadSchema.parse({ uploadId: upload.uploadId }),
    fallbackErrorMessage: 'Unable to finalize logo upload',
  })
}
