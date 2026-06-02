import { buildModelKey, createRedisEngine, type RedisClient } from '@repo/redis'
import { PendingUploadExpiryIndexModel, PendingUploadModel, type PendingUpload } from './upload.model'
import { UploadTracker } from './upload.tracker'

jest.mock('@repo/redis', () => {
  const actual: typeof import('@repo/redis') = jest.requireActual('@repo/redis')

  return {
    ...actual,
    buildModelKey: jest.fn(() => 'storage:v1:upload:test-upload'),
    createRedisEngine: jest.fn(),
  }
})

describe('UploadTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('stores finalized uploads with the provided short ttl and removes them from the expiry index', async () => {
    const exec = jest.fn().mockResolvedValue(undefined)
    const zrem = jest.fn()

    jest.mocked(createRedisEngine).mockReturnValue({
      multi: () => ({
        zset: {
          zrem,
        },
        exec,
      }),
    } as never)

    const set = jest.fn().mockResolvedValue('OK')
    const tracker = new UploadTracker({ set } as unknown as RedisClient)
    const upload: PendingUpload = {
      uploadId: 'test-upload',
      bucket: 'tourna-public-assets',
      temporaryKey: 'tmp/test-upload/avatar.png',
      finalKey: 'public/team/org/2026/06/team-1/avatar.png',
      visibility: 'public',
      assetType: 'team_logo',
      ownerScope: 'org',
      assetId: 'team-1',
      filename: 'avatar.png',
      contentType: 'image/png',
      sizeBytes: 1024,
      status: 'pending',
      createdAt: 1,
      expiresAt: 2,
    }

    await tracker.finalize(upload, 300)

    expect(zrem).toHaveBeenCalledWith(PendingUploadExpiryIndexModel, upload.uploadId)
    expect(exec).toHaveBeenCalled()
    expect(buildModelKey).toHaveBeenCalledWith(PendingUploadModel, [upload.uploadId])
    expect(set).toHaveBeenCalledWith(
      'storage:v1:upload:test-upload',
      expect.any(Buffer),
      'EX',
      300,
    )
  })
})
