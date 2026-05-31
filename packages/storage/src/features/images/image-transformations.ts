import type { MediaAssetType } from '@repo/domain'

export interface ImageVariantDefinition {
  name: string
  width: number
  height?: number
  fit: 'cover' | 'contain' | 'inside'
  format: 'webp' | 'jpeg' | 'png'
  quality: number
}

export const DEFAULT_IMAGE_VARIANTS: Partial<Record<MediaAssetType, ImageVariantDefinition[]>> = {
  avatar: [
    { name: 'thumb', width: 128, height: 128, fit: 'cover', format: 'webp', quality: 82 },
    { name: 'display', width: 512, height: 512, fit: 'cover', format: 'webp', quality: 86 },
  ],
  organization_logo: [
    { name: 'thumb', width: 160, height: 160, fit: 'contain', format: 'webp', quality: 86 },
  ],
  tournament_banner: [
    { name: 'card', width: 960, height: 540, fit: 'cover', format: 'webp', quality: 84 },
    { name: 'hero', width: 1920, height: 720, fit: 'cover', format: 'webp', quality: 86 },
  ],
}

export function buildVariantObjectKey(originalKey: string, variant: ImageVariantDefinition): string {
  const extension = `.${variant.format}`
  const baseKey = originalKey.replace(/\.[a-z0-9]+$/i, '')

  return `${baseKey}/variants/${variant.name}${extension}`
}
