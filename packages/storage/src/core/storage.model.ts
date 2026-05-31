import type { MediaAssetType, Visibility } from '@repo/domain'

export interface StorageObjectDescriptor {
  bucket: string
  key: string
  visibility: Visibility
  assetType: MediaAssetType
  contentType: string
  sizeBytes?: number
  publicUrl?: string
}

export interface PresignedUploadDescriptor {
  uploadId: string
  bucket: string
  key: string
  method: 'PUT'
  url: string
  expiresAt: number
  headers: Record<string, string>
}

export interface PresignedReadDescriptor {
  bucket: string
  key: string
  method: 'GET'
  url: string
  expiresAt: number
}
