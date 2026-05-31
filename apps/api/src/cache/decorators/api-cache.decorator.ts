import { SetMetadata } from '@nestjs/common'
import { API_CACHE_METADATA } from '../cache.constants'

export type HeaderValue = string | string[] | undefined

export interface CacheableHttpRequest {
  method: string
  originalUrl?: string
  url?: string
  params?: Record<string, string | undefined>
  query?: Record<string, unknown>
  headers: Record<string, HeaderValue>
}

export interface ApiCacheOptions {
  namespace: string | readonly string[]
  ttl?: number
  key?: (request: CacheableHttpRequest) => readonly string[]
  varyByLocale?: boolean
}

export const ApiCache = (options: ApiCacheOptions) => SetMetadata(API_CACHE_METADATA, options)
