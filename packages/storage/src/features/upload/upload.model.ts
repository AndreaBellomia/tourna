import { z } from 'zod'
import { JsonCodec, type RedisModel, type RedisZSetModel } from '@repo/redis'
import { MediaAssetTypeSchema, VisibilitySchema } from '@repo/domain'

export const uploadStatusSchema = z.enum(['pending', 'finalized'])

export const pendingUploadSchema = z.object({
  uploadId: z.string(),
  bucket: z.string(),
  temporaryKey: z.string(),
  finalKey: z.string(),
  visibility: VisibilitySchema,
  assetType: MediaAssetTypeSchema,
  ownerScope: z.string(),
  assetId: z.string(),
  filename: z.string(),
  contentType: z.string(),
  sizeBytes: z.number().int().positive(),
  status: uploadStatusSchema,
  createdAt: z.number(),
  expiresAt: z.number(),
  finalizedAt: z.number().optional(),
})

export type PendingUpload = z.infer<typeof pendingUploadSchema>

export const PendingUploadModel: RedisModel<PendingUpload, Buffer, [uploadId: string]> = {
  namespace: 'storage',
  version: 1,
  key: (uploadId) => ['upload', uploadId],
  schema: pendingUploadSchema,
  type: 'string',
  codec: new JsonCodec<PendingUpload>(),
  ttl: 0,
}

export const PendingUploadExpiryIndexModel: RedisZSetModel<[]> = {
  namespace: 'storage',
  version: 1,
  key: () => ['upload_expiry'],
  type: 'zset',
}
