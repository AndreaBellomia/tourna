import { MediaAssetTypeSchema, VisibilitySchema } from '@repo/domain'
import { z } from 'zod'

export const PresignedUploadResponseSchema = z.object({
  uploadId: z.string(),
  bucket: z.string(),
  key: z.string(),
  method: z.literal('PUT'),
  url: z.string().url(),
  expiresAt: z.number(),
  headers: z.record(z.string(), z.string()),
})

export type PresignedUploadResponse = z.infer<typeof PresignedUploadResponseSchema>

export const StorageObjectResponseSchema = z.object({
  bucket: z.string(),
  key: z.string(),
  visibility: VisibilitySchema,
  assetType: MediaAssetTypeSchema,
  contentType: z.string(),
  sizeBytes: z.number().optional(),
  publicUrl: z.string().url().optional(),
})

export type StorageObjectResponse = z.infer<typeof StorageObjectResponseSchema>

export const PresignedReadResponseSchema = z.object({
  bucket: z.string(),
  key: z.string(),
  method: z.literal('GET'),
  url: z.string().url(),
  expiresAt: z.number(),
})

export type PresignedReadResponse = z.infer<typeof PresignedReadResponseSchema>
