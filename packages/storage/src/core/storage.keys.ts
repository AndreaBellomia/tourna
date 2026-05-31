import type { MediaAssetType, Visibility } from '@repo/domain'

export interface BuildStorageKeyInput {
  visibility: Visibility
  assetType: MediaAssetType
  ownerScope: string
  assetId: string
  filename: string
  now?: Date
}

export function buildTemporaryObjectKey(uploadId: string, filename: string): string {
  return ['tmp', sanitizeSegment(uploadId), sanitizeFilename(filename)].join('/')
}

export function buildFinalObjectKey(input: BuildStorageKeyInput): string {
  const now = input.now ?? new Date()
  const yyyy = String(now.getUTCFullYear())
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')

  return [
    input.visibility === 'public' ? 'public' : 'private',
    input.assetType,
    sanitizeSegment(input.ownerScope),
    yyyy,
    mm,
    sanitizeSegment(input.assetId),
    sanitizeFilename(input.filename),
  ].join('/')
}

export function sanitizeSegment(segment: string): string {
  return segment
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function sanitizeFilename(filename: string): string {
  const sanitized = filename
    .trim()
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .at(-1)
    ?.toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return sanitized || 'file'
}
