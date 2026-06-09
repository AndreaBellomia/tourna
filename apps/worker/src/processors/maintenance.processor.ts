import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import {
  MAINTENANCE_HEARTBEAT_JOB_NAME,
  MAINTENANCE_STORAGE_CLEANUP_JOB_NAME,
  maintenanceHeartbeatPayloadSchema,
  maintenanceStorageCleanupPayloadSchema,
} from '@repo/queue'
import { createRedisClient, type RedisClient } from '@repo/redis'
import {
  createStorageClient,
  StorageUploadService,
  UploadTracker,
  type StorageClient,
} from '@repo/storage'
import type { Job } from 'bullmq'
import { WorkerConfigService } from '~/config/worker-config.service'
import { BaseWorkerProcessor, type WorkerProcessDefinition } from './processor.definition'

@Injectable()
export class MaintenanceProcessor extends BaseWorkerProcessor implements OnModuleDestroy {
  private readonly logger = new Logger(MaintenanceProcessor.name)
  private readonly redisClient: RedisClient
  private readonly storageClient: StorageClient
  private readonly storageUploads: StorageUploadService

  constructor(config: WorkerConfigService) {
    super()

    this.redisClient = createRedisClient({
      host: config.get('REDIS_HOST'),
      port: config.get('REDIS_PORT'),
      password: config.get('REDIS_PASSWORD'),
      db: config.get('REDIS_DB'),
    })

    this.storageClient = createStorageClient({
      endpoint: config.get('STORAGE_ENDPOINT'),
      region: config.get('STORAGE_REGION'),
      accessKeyId: config.get('STORAGE_ACCESS_KEY_ID'),
      secretAccessKey: config.get('STORAGE_SECRET_ACCESS_KEY'),
      forcePathStyle: config.get('STORAGE_FORCE_PATH_STYLE'),
    })

    this.storageUploads = new StorageUploadService(
      this.storageClient,
      new UploadTracker(this.redisClient),
      {
        buckets: {
          publicAssets: config.get('STORAGE_PUBLIC_BUCKET'),
          privateAssets: config.get('STORAGE_PRIVATE_BUCKET'),
        },
        publicBaseUrl: config.get('STORAGE_PUBLIC_BASE_URL'),
        uploadTtlSeconds: config.get('STORAGE_UPLOAD_TTL_SECONDS'),
        readTtlSeconds: config.get('STORAGE_READ_TTL_SECONDS'),
      },
    )
  }

  protected getProcessDefinitions(): Array<WorkerProcessDefinition> {
    return [
      {
        jobName: MAINTENANCE_HEARTBEAT_JOB_NAME,
        run: (job) => {
          const payload = maintenanceHeartbeatPayloadSchema.parse(job.data)

          this.logger.log({
            message: 'Maintenance heartbeat processed',
            jobId: job.id,
            scheduledAt: payload.scheduledAt,
          })
        },
      },
      {
        jobName: MAINTENANCE_STORAGE_CLEANUP_JOB_NAME,
        run: async (job) => {
          const payload = maintenanceStorageCleanupPayloadSchema.parse(job.data)
          const result = await this.storageUploads.cleanupOrphanUploads(Date.now(), payload.limit)

          this.logger.log({
            message: 'Storage orphan cleanup processed',
            jobId: job.id,
            scheduledAt: payload.scheduledAt,
            ...result,
          })
        },
      },
    ]
  }

  protected getUnsupportedJobErrorMessage(job: Job): string {
    return `Unsupported maintenance job "${job.name}"`
  }

  async onModuleDestroy(): Promise<void> {
    this.storageClient.destroy()
    await this.redisClient.quit()
  }
}
