import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'
import { bucketForVisibility, type StorageBuckets } from '../core/storage.bucket'
import {
  createStorageClient,
  type StorageClient,
  type StorageClientOptions,
} from '../client/storage.client'

const DEFAULT_STORAGE_ENDPOINT = 'http://localhost:9000'
const DEFAULT_STORAGE_REGION = 'us-east-1'
const DEFAULT_STORAGE_ACCESS_KEY_ID = 'tourna'
const DEFAULT_STORAGE_SECRET_ACCESS_KEY = 'tourna-secret'
const DEFAULT_BUCKET_PREFIX = 'tourna-test'

export type TestStorageEnvironment = {
  client: StorageClient
  buckets: StorageBuckets
  reset: () => Promise<void>
  destroy: () => Promise<void>
}

export type CreateStorageTestEnvironmentOptions = Partial<StorageClientOptions> & {
  bucketPrefix?: string
  runId?: string
  workerId?: string
}

export async function createStorageTestEnvironment(
  options: CreateStorageTestEnvironmentOptions = {},
): Promise<TestStorageEnvironment> {
  const client = createStorageClient({
    endpoint: options.endpoint ?? process.env.STORAGE_TEST_ENDPOINT ?? DEFAULT_STORAGE_ENDPOINT,
    region: options.region ?? process.env.STORAGE_TEST_REGION ?? DEFAULT_STORAGE_REGION,
    accessKeyId:
      options.accessKeyId ??
      process.env.STORAGE_TEST_ACCESS_KEY_ID ??
      DEFAULT_STORAGE_ACCESS_KEY_ID,
    secretAccessKey:
      options.secretAccessKey ??
      process.env.STORAGE_TEST_SECRET_ACCESS_KEY ??
      DEFAULT_STORAGE_SECRET_ACCESS_KEY,
    forcePathStyle: options.forcePathStyle ?? true,
  })
  const buckets = buildStorageTestBuckets(options)

  await ensureBucket(client, buckets.publicAssets)
  await ensureBucket(client, buckets.privateAssets)

  const environment: TestStorageEnvironment = {
    client,
    buckets,
    reset: async () => {
      await emptyBucket(client, buckets.publicAssets)
      await emptyBucket(client, buckets.privateAssets)
    },
    destroy: async () => {
      await deleteBucket(client, buckets.publicAssets)
      await deleteBucket(client, buckets.privateAssets)
      client.destroy()
    },
  }

  await environment.reset()

  return environment
}

export async function emptyBucket(client: StorageClient, bucket: string) {
  let continuationToken: string | undefined

  do {
    const listed = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      }),
    )
    const objects = listed.Contents?.map((object) => ({ Key: object.Key })).filter(
      (object): object is { Key: string } => typeof object.Key === 'string',
    )

    if (objects && objects.length > 0) {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: objects,
            Quiet: true,
          },
        }),
      )
    }

    continuationToken = listed.NextContinuationToken
  } while (continuationToken)
}

export function getTestBucketForVisibility(
  environment: Pick<TestStorageEnvironment, 'buckets'>,
  visibility: Parameters<typeof bucketForVisibility>[1],
) {
  return bucketForVisibility(environment.buckets, visibility)
}

async function ensureBucket(client: StorageClient, bucket: string) {
  try {
    await client.send(new CreateBucketCommand({ Bucket: bucket }))
  } catch (error) {
    if (!isBucketAlreadyOwnedError(error)) {
      throw new Error(`Failed to create MinIO test bucket ${bucket}`, { cause: error })
    }
  }
}

async function deleteBucket(client: StorageClient, bucket: string) {
  await emptyBucket(client, bucket)

  try {
    await client.send(new DeleteBucketCommand({ Bucket: bucket }))
  } catch (error) {
    if (!isNoSuchBucketError(error)) {
      throw error
    }
  }
}

function buildStorageTestBuckets(options: CreateStorageTestEnvironmentOptions): StorageBuckets {
  const prefix = sanitizeBucketSegment(options.bucketPrefix ?? DEFAULT_BUCKET_PREFIX)
  const runId = sanitizeBucketSegment(
    options.runId ?? process.env.TOURNA_TEST_RUN_ID ?? randomUUID().slice(0, 8),
  )
  const workerId = sanitizeBucketSegment(options.workerId ?? process.env.JEST_WORKER_ID ?? '1')
  const base = `${prefix}-${runId}-${workerId}`.slice(0, 52)

  return {
    publicAssets: `${base}-public`,
    privateAssets: `${base}-private`,
  }
}

function sanitizeBucketSegment(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'test'
  )
}

function isBucketAlreadyOwnedError(error: unknown) {
  return (
    getErrorName(error) === 'BucketAlreadyOwnedByYou' ||
    getErrorName(error) === 'BucketAlreadyExists'
  )
}

function isNoSuchBucketError(error: unknown) {
  return getErrorName(error) === 'NoSuchBucket'
}

function getErrorName(error: unknown) {
  return error instanceof Error ? error.name : undefined
}
