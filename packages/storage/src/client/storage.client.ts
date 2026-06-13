import { S3Client } from '@aws-sdk/client-s3'

export interface StorageClientOptions {
  endpoint?: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  forcePathStyle?: boolean
}

export function createStorageClient(options: StorageClientOptions): StorageClient {
  return new S3Client({
    endpoint: options.endpoint || undefined,
    region: options.region,
    forcePathStyle: options.forcePathStyle ?? false,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
    credentials: {
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
    },
  })
}

export type StorageClient = S3Client
