import { CallHandler, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { firstValueFrom, of } from 'rxjs'
import { ApiCacheInterceptor } from './api-cache.interceptor'
import { CacheService } from './cache.service'
import { AppConfigService } from '~/config/config.service'

describe('ApiCacheInterceptor', () => {
  const cacheService = {
    get: jest.fn(),
    set: jest.fn(),
  } as unknown as CacheService
  const configService = {
    get: jest.fn(() => 120),
  } as unknown as AppConfigService
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector

  const handler = jest.fn()
  const controller = jest.fn()
  const request = {
    method: 'GET',
    originalUrl: '/api/v1/tournaments/demo?tab=overview',
    headers: {
      'accept-language': 'it-IT,it;q=0.9,en;q=0.8',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns cached data without calling the route handler', async () => {
    const interceptor = new ApiCacheInterceptor(cacheService, configService, reflector)
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce({
      namespace: ['tournaments', 'page'],
    })
    jest.spyOn(cacheService, 'get').mockResolvedValueOnce({ cached: true })
    const next = {
      handle: jest.fn(() => of({ fresh: true })),
    } as CallHandler

    const result = await firstValueFrom(interceptor.intercept(createContext(request), next))

    expect(result).toEqual({ cached: true })
    expect(next.handle).not.toHaveBeenCalled()
    expect(cacheService.set).not.toHaveBeenCalled()
  })

  it('stores fresh data with the resolved locale on cache miss', async () => {
    const interceptor = new ApiCacheInterceptor(cacheService, configService, reflector)
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce({
      namespace: ['tournaments', 'page'],
      ttl: 60,
    })
    jest.spyOn(cacheService, 'get').mockResolvedValueOnce(null)
    jest.spyOn(cacheService, 'set').mockResolvedValueOnce()
    const next = {
      handle: jest.fn(() => of({ fresh: true })),
    } as CallHandler

    const result = await firstValueFrom(interceptor.intercept(createContext(request), next))

    expect(result).toEqual({ fresh: true })
    expect(cacheService.set).toHaveBeenCalledWith(
      expect.stringMatching(/^http:v1:tournaments:page:[^:]+:locale:it-it$/),
      { fresh: true },
      60,
    )
  })

  it('ignores routes without api cache metadata', async () => {
    const interceptor = new ApiCacheInterceptor(cacheService, configService, reflector)
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(undefined)
    const next = {
      handle: jest.fn(() => of({ live: true })),
    } as CallHandler

    const result = await firstValueFrom(interceptor.intercept(createContext(request), next))

    expect(result).toEqual({ live: true })
    expect(cacheService.get).not.toHaveBeenCalled()
  })

  function createContext(req: typeof request): ExecutionContext {
    return {
      getType: () => 'http',
      getHandler: () => handler,
      getClass: () => controller,
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as unknown as ExecutionContext
  }
})
