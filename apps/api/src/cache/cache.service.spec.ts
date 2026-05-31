import { CacheService } from './cache.service'
import { RedisService } from '../redis/redis.service'

describe('CacheService', () => {
  let service: CacheService
  const getBuffer = jest.fn()
  const set = jest.fn()
  const del = jest.fn()
  const scan = jest.fn()
  const redisMock = {
    getClient: () => ({
      getBuffer,
      set,
      del,
      scan,
    }),
  } as unknown as RedisService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new CacheService(redisMock)
  })

  it('returns null when key is missing', async () => {
    getBuffer.mockResolvedValueOnce(null)
    await expect(service.get('k')).resolves.toBeNull()
  })

  it('encodes and stores values with TTL when provided', async () => {
    await service.set('k', { a: 1 }, 30)
    expect(set).toHaveBeenCalledTimes(1)
    expect(set).toHaveBeenCalledWith('k', expect.any(Buffer), 'EX', 30)
  })

  it('deletes values by key', async () => {
    await service.del('k')
    expect(del).toHaveBeenCalledWith('k')
  })

  it('deletes values by key prefix using scan batches', async () => {
    scan
      .mockResolvedValueOnce(['12', ['http:v1:tournaments:locale:it:a']])
      .mockResolvedValueOnce(['0', ['http:v1:tournaments:locale:en:b']])
    del.mockResolvedValueOnce(1).mockResolvedValueOnce(1)

    await expect(service.deleteByPrefix(['http', 'v1', 'tournaments'])).resolves.toBe(2)

    expect(scan).toHaveBeenNthCalledWith(1, '0', 'MATCH', 'http:v1:tournaments:*', 'COUNT', 100)
    expect(scan).toHaveBeenNthCalledWith(2, '12', 'MATCH', 'http:v1:tournaments:*', 'COUNT', 100)
    expect(del).toHaveBeenNthCalledWith(1, 'http:v1:tournaments:locale:it:a')
    expect(del).toHaveBeenNthCalledWith(2, 'http:v1:tournaments:locale:en:b')
  })

  it('returns cached falsy values without calling factory', async () => {
    await service.set('counter', 0, 10)
    const firstSetCall = set.mock.calls[0] as [string, Buffer]
    const cachedBuffer = firstSetCall[1]
    getBuffer.mockResolvedValueOnce(cachedBuffer)

    const factory = jest.fn(() => Promise.resolve(10))
    const result = await service.getOrSet<number>(['counter'], factory, 10)

    expect(result).toBe(0)
    expect(factory).not.toHaveBeenCalled()
  })

  it('calls factory and stores value when cache miss occurs', async () => {
    getBuffer.mockResolvedValueOnce(null)
    const factory = jest.fn(() => Promise.resolve({ ok: true }))

    const result = await service.getOrSet(['feature', 'flag'], factory, 60)

    expect(result).toEqual({ ok: true })
    expect(factory).toHaveBeenCalledTimes(1)
    expect(set).toHaveBeenCalledWith('feature:flag', expect.any(Buffer), 'EX', 60)
  })
})
