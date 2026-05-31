import { z } from 'zod'

export const MEDIA_ASSET_TYPES = [
  'avatar',
  'organization_logo',
  'tournament_banner',
  'result_evidence',
  'document',
  'generic_media',
] as const

export const MediaAssetTypeSchema = z.enum(MEDIA_ASSET_TYPES)

export type MediaAssetType = z.infer<typeof MediaAssetTypeSchema>
