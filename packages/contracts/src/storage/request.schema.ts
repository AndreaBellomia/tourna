import { MediaAssetTypeSchema, VisibilitySchema } from '@repo/domain'
import { z } from 'zod'

export const CreatePresignedUploadSchema = z.object({
  visibility: VisibilitySchema,
  assetType: MediaAssetTypeSchema,
  ownerScope: z.string().trim().min(1).max(120),
  assetId: z.string().trim().min(1).max(120),
  filename: z.string().trim().min(1).max(240),
  contentType: z.string().trim().min(1).max(120),
  sizeBytes: z.number().int().positive().max(50 * 1024 * 1024),
})

export type CreatePresignedUploadInput = z.infer<typeof CreatePresignedUploadSchema>

export const FinalizeUploadSchema = z.object({
  uploadId: z.string().uuid(),
})

export type FinalizeUploadInput = z.infer<typeof FinalizeUploadSchema>

export const CreatePresignedReadSchema = z.object({
  bucket: z.string().trim().min(1),
  key: z.string().trim().min(1),
})

export type CreatePresignedReadInput = z.infer<typeof CreatePresignedReadSchema>
