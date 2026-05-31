import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'node:crypto'
import type { MediaAssetType, Visibility } from '@repo/domain'
import type { StorageClient } from '../../client/storage.client'
import { bucketForVisibility, type StorageBuckets } from '../../core/storage.bucket'
import { UploadAlreadyFinalizedError, UploadedObjectMissingError, UploadNotFoundError } from '../../core/storage.errors'
import { buildFinalObjectKey, buildTemporaryObjectKey, sanitizeFilename } from '../../core/storage.keys'
import type {
  PresignedReadDescriptor,
  PresignedUploadDescriptor,
  StorageObjectDescriptor,
} from '../../core/storage.model'
import type { UploadTracker } from './upload.tracker'
import type { PendingUpload } from './upload.model'

export interface StorageUploadServiceOptions {
  buckets: StorageBuckets
  publicBaseUrl?: string
  uploadTtlSeconds: number
  readTtlSeconds: number
}

export interface CreatePresignedUploadInput {
  visibility: Visibility
  assetType: MediaAssetType
  ownerScope: string
  assetId: string
  filename: string
  contentType: string
  sizeBytes: number
}

export interface CleanupOrphanUploadsResult {
  scanned: number
  deleted: number
  missing: number
}

export class StorageUploadService {
  constructor(
    private readonly client: StorageClient,
    private readonly tracker: UploadTracker,
    private readonly options: StorageUploadServiceOptions,
  ) {}

  async createPresignedUpload(input: CreatePresignedUploadInput): Promise<PresignedUploadDescriptor> {
    const uploadId = randomUUID()
    const filename = sanitizeFilename(input.filename)
    const bucket = bucketForVisibility(this.options.buckets, input.visibility)
    const temporaryKey = buildTemporaryObjectKey(uploadId, filename)
    const finalKey = buildFinalObjectKey({
      visibility: input.visibility,
      assetType: input.assetType,
      ownerScope: input.ownerScope,
      assetId: input.assetId,
      filename,
    })
    const now = Date.now()
    const expiresAt = now + this.options.uploadTtlSeconds * 1000

    const upload: PendingUpload = {
      uploadId,
      bucket,
      temporaryKey,
      finalKey,
      visibility: input.visibility,
      assetType: input.assetType,
      ownerScope: input.ownerScope,
      assetId: input.assetId,
      filename,
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
      status: 'pending',
      createdAt: now,
      expiresAt,
    }

    await this.tracker.create(upload, this.options.uploadTtlSeconds)

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: temporaryKey,
      ContentType: input.contentType,
      ContentLength: input.sizeBytes,
      Metadata: {
        uploadId,
        assetType: input.assetType,
      },
    })

    const url = await getSignedUrl(this.client, command, {
      expiresIn: this.options.uploadTtlSeconds,
    })

    return {
      uploadId,
      bucket,
      key: temporaryKey,
      method: 'PUT',
      url,
      expiresAt,
      headers: {
        'content-type': input.contentType,
      },
    }
  }

  async finalizeUpload(uploadId: string): Promise<StorageObjectDescriptor> {
    const upload = await this.tracker.get(uploadId)

    if (!upload) {
      throw new UploadNotFoundError(uploadId)
    }

    if (upload.status === 'finalized') {
      throw new UploadAlreadyFinalizedError(uploadId)
    }

    const head = await this.headUploadedObject(upload)

    await this.client.send(
      new CopyObjectCommand({
        Bucket: upload.bucket,
        Key: upload.finalKey,
        CopySource: encodeCopySource(upload.bucket, upload.temporaryKey),
        ContentType: upload.contentType,
        MetadataDirective: 'REPLACE',
        Metadata: {
          uploadId,
          assetType: upload.assetType,
        },
      }),
    )

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: upload.bucket,
        Key: upload.temporaryKey,
      }),
    )

    await this.tracker.finalize(upload)

    return this.toObjectDescriptor(upload, head.ContentLength)
  }

  async createPresignedReadUrl(
    object: Pick<StorageObjectDescriptor, 'bucket' | 'key'>,
  ): Promise<PresignedReadDescriptor> {
    const expiresAt = Date.now() + this.options.readTtlSeconds * 1000
    const url = await getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: object.bucket,
        Key: object.key,
      }),
      { expiresIn: this.options.readTtlSeconds },
    )

    return {
      bucket: object.bucket,
      key: object.key,
      method: 'GET',
      url,
      expiresAt,
    }
  }

  async cleanupOrphanUploads(now = Date.now(), limit = 100): Promise<CleanupOrphanUploadsResult> {
    const uploadIds = await this.tracker.getExpiredUploadIds(now, limit)
    const result: CleanupOrphanUploadsResult = {
      scanned: uploadIds.length,
      deleted: 0,
      missing: 0,
    }

    for (const uploadId of uploadIds) {
      const upload = await this.tracker.get(uploadId)

      if (!upload || upload.status !== 'pending') {
        await this.tracker.remove(uploadId)
        result.missing += 1
        continue
      }

      await this.client.send(
        new DeleteObjectCommand({
          Bucket: upload.bucket,
          Key: upload.temporaryKey,
        }),
      )
      await this.tracker.remove(uploadId)
      result.deleted += 1
    }

    return result
  }

  private async headUploadedObject(upload: PendingUpload) {
    try {
      return await this.client.send(
        new HeadObjectCommand({
          Bucket: upload.bucket,
          Key: upload.temporaryKey,
        }),
      )
    } catch {
      throw new UploadedObjectMissingError(upload.uploadId)
    }
  }

  private toObjectDescriptor(upload: PendingUpload, sizeBytes?: number): StorageObjectDescriptor {
    return {
      bucket: upload.bucket,
      key: upload.finalKey,
      visibility: upload.visibility,
      assetType: upload.assetType,
      contentType: upload.contentType,
      sizeBytes,
      publicUrl:
        upload.visibility === 'public' && this.options.publicBaseUrl
          ? `${this.options.publicBaseUrl.replace(/\/$/, '')}/${upload.finalKey}`
          : undefined,
    }
  }
}

function encodeCopySource(bucket: string, key: string): string {
  return `${bucket}/${key.split('/').map(encodeURIComponent).join('/')}`
}
