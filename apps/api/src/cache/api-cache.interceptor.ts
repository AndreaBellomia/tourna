import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestMethod,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { rawBuildKey } from '@repo/redis'
import { createHash } from 'node:crypto'
import { from, map, mergeMap, Observable, of, switchMap } from 'rxjs'
import { API_CACHE_KEY_PREFIX, API_CACHE_METADATA } from './cache.constants'
import { AppConfigService } from '~/config/config.service'
import { CacheService } from './cache.service'
import {
  ApiCacheOptions,
  CacheableHttpRequest,
  HeaderValue,
} from './decorators/api-cache.decorator'

@Injectable()
export class ApiCacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: CacheService,
    private readonly configService: AppConfigService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
    const options = this.reflector.getAllAndOverride<ApiCacheOptions>(API_CACHE_METADATA, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!options || context.getType() !== 'http') return next.handle()

    const request = context.switchToHttp().getRequest<CacheableHttpRequest>()
    if (!this.isCacheableMethod(request.method)) return next.handle()

    const key = this.buildCacheKey(options, request)

    return from(this.cacheService.get<unknown>(key)).pipe(
      switchMap((cached) => {
        if (cached !== null) return of(cached)

        return next
          .handle()
          .pipe(
            mergeMap((fresh) =>
              from(this.cacheService.set(key, fresh, this.ttl(options))).pipe(map(() => fresh)),
            ),
          )
      }),
    )
  }

  private buildCacheKey(options: ApiCacheOptions, request: CacheableHttpRequest): string {
    const namespace =
      typeof options.namespace === 'string' ? [options.namespace] : [...options.namespace]
    const locale = options.varyByLocale === false ? [] : ['locale', this.resolveLocale(request)]
    const keyParts = [...(options.key?.(request) ?? [this.hashRequest(request)])]
    const parts = [...API_CACHE_KEY_PREFIX, ...namespace, ...keyParts, ...locale]

    return rawBuildKey(...parts)
  }

  private hashRequest(request: CacheableHttpRequest): string {
    const url = request.originalUrl ?? request.url ?? ''
    return createHash('sha256').update(`${request.method.toUpperCase()} ${url}`).digest('base64url')
  }

  private resolveLocale(request: CacheableHttpRequest): string {
    const explicitLocale = this.firstHeader(request.headers['x-locale'])
    const explicitLanguage = this.firstHeader(request.headers['x-language'])
    const acceptLanguage = this.firstHeader(request.headers['accept-language'])
    const raw = explicitLocale ?? explicitLanguage ?? acceptLanguage ?? 'default'
    return raw.split(',')[0]?.trim().toLowerCase() || 'default'
  }

  private firstHeader(value: HeaderValue): string | undefined {
    return Array.isArray(value) ? value[0] : value
  }

  private ttl(options: ApiCacheOptions): number {
    return options.ttl ?? this.configService.get('CACHE_DURATION_API_RESPONSE')
  }

  private isCacheableMethod(method: string): boolean {
    const normalized = method.toUpperCase()
    return (
      normalized === RequestMethod[RequestMethod.GET] ||
      normalized === RequestMethod[RequestMethod.HEAD]
    )
  }
}
