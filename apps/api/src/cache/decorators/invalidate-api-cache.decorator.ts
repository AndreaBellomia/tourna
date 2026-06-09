import { API_CACHE_KEY_PREFIX } from '~/cache/cache.constants'
import { CacheService } from '~/cache/cache.service'

type CacheKeyFactory = (...args: unknown[]) => readonly string[] | Promise<readonly string[]>
type CacheKeyResolvable = readonly string[] | CacheKeyFactory

export interface InvalidateApiCacheOptions {
  prefixes: readonly CacheKeyResolvable[]
  cacheServiceProperty?: string
}

type CacheServiceHost = Record<string, unknown>

export function InvalidateApiCache(options: InvalidateApiCacheOptions): MethodDecorator {
  return <T>(
    _target: object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    const original = descriptor.value

    if (typeof original !== 'function') {
      throw new Error('@InvalidateApiCache can only decorate methods')
    }

    const originalMethod = original as (this: CacheServiceHost, ...args: unknown[]) => unknown

    descriptor.value = function (this: CacheServiceHost, ...args: unknown[]): unknown {
      const result = Reflect.apply(originalMethod, this, args)

      if (isPromiseLike(result)) {
        return result.then(async (value: unknown): Promise<unknown> => {
          await invalidate(this, options, args)
          return value
        })
      }

      return Promise.resolve<unknown>(result).then(async (value: unknown): Promise<unknown> => {
        await invalidate(this, options, args)
        return value
      })
    } as T
  }
}

async function invalidate(
  host: CacheServiceHost,
  options: InvalidateApiCacheOptions,
  args: unknown[],
): Promise<void> {
  const cacheService = resolveCacheService(host, options.cacheServiceProperty)

  await Promise.all(
    options.prefixes.map(async (prefix) => {
      const resolved = typeof prefix === 'function' ? await prefix(...args) : prefix
      await cacheService.deleteByPrefix([...API_CACHE_KEY_PREFIX, ...resolved])
    }),
  )
}

function resolveCacheService(host: CacheServiceHost, propertyName = 'cacheService'): CacheService {
  const candidate = host[propertyName]

  if (isCacheService(candidate)) return candidate

  throw new Error(`@InvalidateApiCache requires a CacheService property named "${propertyName}"`)
}

function isCacheService(value: unknown): value is CacheService {
  return (
    typeof value === 'object' &&
    value !== null &&
    'deleteByPrefix' in value &&
    typeof value.deleteByPrefix === 'function'
  )
}

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  )
}
