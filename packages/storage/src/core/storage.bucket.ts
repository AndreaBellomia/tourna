import type { Visibility } from '@repo/domain'

export interface StorageBuckets {
  publicAssets: string
  privateAssets: string
}

export function bucketForVisibility(buckets: StorageBuckets, visibility: Visibility): string {
  return visibility === 'public' ? buckets.publicAssets : buckets.privateAssets
}
