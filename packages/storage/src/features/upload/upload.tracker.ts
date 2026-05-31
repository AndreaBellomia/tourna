import { buildModelKey, createRedisEngine, type RedisClient, type RedisEngine } from '@repo/redis'
import { PendingUploadExpiryIndexModel, PendingUploadModel, type PendingUpload } from './upload.model'

export class UploadTracker {
  private readonly engine: RedisEngine

  constructor(private readonly client: RedisClient) {
    this.engine = createRedisEngine(client)
  }

  async create(upload: PendingUpload, ttlSeconds: number): Promise<void> {
    const tx = this.engine.multi()

    tx.zset.zadd(PendingUploadExpiryIndexModel, upload.expiresAt, upload.uploadId)

    await tx.exec()
    await this.setUpload(upload, ttlSeconds)
  }

  async get(uploadId: string): Promise<PendingUpload | null> {
    return this.engine.kv.get(PendingUploadModel, uploadId)
  }

  async finalize(upload: PendingUpload): Promise<void> {
    const finalizedUpload: PendingUpload = {
      ...upload,
      status: 'finalized',
      finalizedAt: Date.now(),
    }

    const tx = this.engine.multi()

    tx.zset.zrem(PendingUploadExpiryIndexModel, upload.uploadId)

    await tx.exec()
    await this.setUpload(finalizedUpload, 60 * 60 * 24)
  }

  async remove(uploadId: string): Promise<void> {
    const tx = this.engine.multi()

    tx.kv.delete(PendingUploadModel, uploadId)
    tx.zset.zrem(PendingUploadExpiryIndexModel, uploadId)

    await tx.exec()
  }

  async getExpiredUploadIds(now: number, limit: number): Promise<string[]> {
    const ids = await this.engine.zset.zrangebyscore(PendingUploadExpiryIndexModel, 0, now)

    return ids.slice(0, limit)
  }

  private async setUpload(upload: PendingUpload, ttlSeconds: number): Promise<void> {
    const key = buildModelKey(PendingUploadModel, [upload.uploadId])
    const validated = PendingUploadModel.schema.parse(upload)
    const encoded = PendingUploadModel.codec.encode(validated)

    await this.client.set(key, encoded, 'EX', ttlSeconds)
  }
}
