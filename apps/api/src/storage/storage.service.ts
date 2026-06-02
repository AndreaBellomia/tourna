import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common'
import {
  StorageUploadService,
  UploadAlreadyFinalizedError,
  UploadedObjectMissingError,
  UploadNotFoundError,
  UploadTracker,
  type CleanupOrphanUploadsResult,
  type PresignedReadDescriptor,
  type PresignedUploadDescriptor,
  type StorageClient,
  type StorageObjectDescriptor,
} from '@repo/storage'
import type { CreatePresignedReadInput, CreatePresignedUploadInput } from '@repo/contracts'
import { RedisService } from '../redis/redis.service'
import { AppConfigService } from '../config/config.service'
import { STORAGE_CLIENT } from './storage.tokens'

@Injectable()
export class StorageService implements OnModuleDestroy {
  private readonly uploads: StorageUploadService
  private readonly publicBaseUrl?: string
  private readonly publicBucket: string

  constructor(
    @Inject(STORAGE_CLIENT)
    private readonly client: StorageClient,
    redis: RedisService,
    config: AppConfigService,
  ) {
    this.publicBaseUrl = config.get('STORAGE_PUBLIC_BASE_URL')
    this.publicBucket = config.get('STORAGE_PUBLIC_BUCKET')
    this.uploads = new StorageUploadService(this.client, new UploadTracker(redis.getClient()), {
      buckets: {
        publicAssets: this.publicBucket,
        privateAssets: config.get('STORAGE_PRIVATE_BUCKET'),
      },
      publicBaseUrl: this.publicBaseUrl,
      uploadTtlSeconds: config.get('STORAGE_UPLOAD_TTL_SECONDS'),
      readTtlSeconds: config.get('STORAGE_READ_TTL_SECONDS'),
    })
  }

  createPresignedUpload(input: CreatePresignedUploadInput): Promise<PresignedUploadDescriptor> {
    return this.uploads.createPresignedUpload(input)
  }

  async finalizeUpload(uploadId: string): Promise<StorageObjectDescriptor> {
    try {
      return await this.uploads.finalizeUpload(uploadId)
    } catch (error) {
      if (error instanceof UploadNotFoundError || error instanceof UploadedObjectMissingError) {
        throw new NotFoundException(error.message)
      }

      if (error instanceof UploadAlreadyFinalizedError) {
        throw new ConflictException(error.message)
      }

      throw error
    }
  }

  createPresignedReadUrl(input: CreatePresignedReadInput): Promise<PresignedReadDescriptor> {
    return this.uploads.createPresignedReadUrl(input)
  }

  async createPublicObjectReadUrl(key: string | null | undefined): Promise<string | null> {
    if (!key) {
      return null
    }

    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`
    }

    const read = await this.createPresignedReadUrl({
      bucket: this.publicBucket,
      key,
    })

    return read.url
  }

  cleanupOrphanUploads(limit?: number): Promise<CleanupOrphanUploadsResult> {
    return this.uploads.cleanupOrphanUploads(Date.now(), limit)
  }

  onModuleDestroy() {
    this.client.destroy()
  }
}
