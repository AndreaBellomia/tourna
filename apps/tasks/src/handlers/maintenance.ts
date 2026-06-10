import { logger } from '@trigger.dev/sdk'
import { createRedisClient } from '@repo/redis'
import {
  createStorageClient,
  StorageUploadService,
  UploadTracker,
  type StorageClient,
} from '@repo/storage'
import type { MaintenanceHeartbeatPayload, MaintenanceStorageCleanupPayload } from '@repo/tasks'
import { getTaskEnv } from '../config/env'

export function processMaintenanceHeartbeat(
  payload: MaintenanceHeartbeatPayload,
): void {
  logger.info('Maintenance heartbeat processed', {
    scheduledAt: payload.scheduledAt,
  })
}

export async function cleanupOrphanUploads(
  payload: MaintenanceStorageCleanupPayload,
): Promise<void> {
  const env = getTaskEnv()
  const redisClient = createRedisClient({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
  })
  const storageClient = createTaskStorageClient(env)

  try {
    const storageUploads = new StorageUploadService(
      storageClient,
      new UploadTracker(redisClient),
      {
        buckets: {
          publicAssets: env.STORAGE_PUBLIC_BUCKET,
          privateAssets: env.STORAGE_PRIVATE_BUCKET,
        },
        publicBaseUrl: env.STORAGE_PUBLIC_BASE_URL,
        uploadTtlSeconds: env.STORAGE_UPLOAD_TTL_SECONDS,
        readTtlSeconds: env.STORAGE_READ_TTL_SECONDS,
      },
    )
    const result = await storageUploads.cleanupOrphanUploads(Date.now(), payload.limit)

    logger.info('Storage orphan cleanup processed', {
      scheduledAt: payload.scheduledAt,
      ...result,
    })
  } finally {
    storageClient.destroy()
    await redisClient.quit()
  }
}

function createTaskStorageClient(env: ReturnType<typeof getTaskEnv>): StorageClient {
  return createStorageClient({
    endpoint: env.STORAGE_ENDPOINT,
    region: env.STORAGE_REGION,
    accessKeyId: env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
    forcePathStyle: env.STORAGE_FORCE_PATH_STYLE,
  })
}
