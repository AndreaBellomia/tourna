import { HeadObjectCommand } from '@aws-sdk/client-s3'
import { createRedisTestEnvironment, type TestRedisEnvironment } from '@repo/redis/testing'
import { createStorageTestEnvironment, type TestStorageEnvironment } from '@repo/storage/testing'
import { UploadTracker } from './upload.tracker'
import { StorageUploadService } from './upload.service'

describe('StorageUploadService integration', () => {
  let redisEnvironment: TestRedisEnvironment
  let storageEnvironment: TestStorageEnvironment
  let tracker: UploadTracker
  let service: StorageUploadService

  beforeAll(async () => {
    redisEnvironment = await createRedisTestEnvironment({
      runId: 'storage-upload-service',
    })
    storageEnvironment = await createStorageTestEnvironment({
      runId: 'storage-upload-service',
    })
    tracker = new UploadTracker(redisEnvironment.client)
    service = new StorageUploadService(storageEnvironment.client, tracker, {
      buckets: storageEnvironment.buckets,
      publicBaseUrl: 'https://cdn.test',
      uploadTtlSeconds: 60,
      readTtlSeconds: 60,
      finalizedUploadTtlSeconds: 60,
    })
  }, 30_000)

  afterEach(async () => {
    await storageEnvironment?.reset()
    await redisEnvironment?.reset()
  })

  afterAll(async () => {
    await storageEnvironment?.destroy()
    await redisEnvironment?.destroy()
  })

  it('uploads to temporary storage and finalizes into an isolated MinIO bucket', async () => {
    const upload = await service.createPresignedUpload({
      visibility: 'public',
      assetType: 'team_logo',
      ownerScope: 'teams',
      assetId: 'team-1',
      filename: 'logo.png',
      contentType: 'image/png',
      sizeBytes: 11,
    })

    expect(upload.bucket).toBe(storageEnvironment.buckets.publicAssets)
    expect(upload.key).toMatch(/^tmp\/.+\/logo\.png$/)

    const uploadResponse = await fetch(upload.url, {
      method: upload.method,
      headers: upload.headers,
      body: Buffer.from('hello-minio'),
    })

    expect(uploadResponse.ok).toBe(true)

    const finalized = await service.finalizeUpload(upload.uploadId)

    expect(finalized.key).toContain('/team-1/logo.png')
    expect(finalized.publicUrl).toContain('/team-1/logo.png')
    expect(finalized).toMatchObject({
      bucket: storageEnvironment.buckets.publicAssets,
      visibility: 'public',
      assetType: 'team_logo',
      contentType: 'image/png',
      sizeBytes: 11,
    })

    await expect(
      storageEnvironment.client.send(
        new HeadObjectCommand({
          Bucket: finalized.bucket,
          Key: finalized.key,
        }),
      ),
    ).resolves.toMatchObject({
      ContentLength: 11,
    })
    await expect(tracker.get(upload.uploadId)).resolves.toMatchObject({
      status: 'finalized',
      finalKey: finalized.key,
    })
  }, 30_000)
})
