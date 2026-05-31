import { InvalidateApiCache } from './invalidate-api-cache.decorator'

describe('InvalidateApiCache', () => {
  interface CacheServiceStub {
    deleteByPrefix: jest.Mock<Promise<number>, [readonly string[]]>
  }

  it('deletes api cache prefixes after a successful method call', async () => {
    const cacheService: CacheServiceStub = {
      deleteByPrefix: jest.fn(async (prefix: readonly string[]) => {
        void prefix
        await Promise.resolve()
        return 2
      }),
    }

    class TournamentWriter {
      constructor(public readonly cacheService: CacheServiceStub) {}

      @InvalidateApiCache({
        prefixes: [(id) => ['tournaments', 'page', String(id)]],
      })
      async rename(id: string): Promise<string> {
        await Promise.resolve()
        return `renamed-${id}`
      }
    }

    const service = new TournamentWriter(cacheService)

    await expect(service.rename('abc')).resolves.toBe('renamed-abc')
    expect(cacheService.deleteByPrefix).toHaveBeenCalledWith([
      'http',
      'v1',
      'tournaments',
      'page',
      'abc',
    ])
  })

  it('does not invalidate cache when the decorated method fails', async () => {
    const cacheService: CacheServiceStub = {
      deleteByPrefix: jest.fn(async (prefix: readonly string[]) => {
        void prefix
        await Promise.resolve()
        return 0
      }),
    }

    class TournamentWriter {
      constructor(public readonly cacheService: CacheServiceStub) {}

      @InvalidateApiCache({
        prefixes: [['tournaments']],
      })
      async fail(): Promise<void> {
        await Promise.resolve()
        throw new Error('boom')
      }
    }

    const service = new TournamentWriter(cacheService)

    await expect(service.fail()).rejects.toThrow('boom')
    expect(cacheService.deleteByPrefix).not.toHaveBeenCalled()
  })
})
