import { RedisService } from './redis.service'
import type { RedisClient } from '@repo/redis'

describe('RedisService', () => {
  const quitMock = jest.fn()
  const pingMock = jest.fn()

  const clientMock = {
    quit: quitMock,
    ping: pingMock,
  } as unknown as RedisClient

  let service: RedisService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new RedisService(clientMock)
  })

  it('exposes the underlying redis client', () => {
    expect(service.getClient()).toBe(clientMock)
  })

  it('creates a redis engine from the client', () => {
    expect(service.engine).toBeDefined()
    expect(service.engine.kv).toBeDefined()
    expect(service.engine.hash).toBeDefined()
    expect(service.engine.list).toBeDefined()
    expect(service.engine.set).toBeDefined()
    expect(service.engine.zset).toBeDefined()
  })

  it('quits the redis client on module destroy', async () => {
    await service.onModuleDestroy()

    expect(quitMock).toHaveBeenCalledTimes(1)
  })
})
