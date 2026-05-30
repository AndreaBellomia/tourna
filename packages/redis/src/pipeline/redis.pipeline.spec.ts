import { PendingResult } from './pending-result'
import { RedisPipeline } from './redis.pipeline'
import type { RedisModel, RedisZSetModel } from '../core/redis.model'
import { JsonCodec } from '../codecs/json.codec'
import { z } from 'zod'

/* ------------------------------------------------------------------ */
/*  Mock helpers                                                       */
/* ------------------------------------------------------------------ */

function createMockCommander(execResults: Array<[Error | null, unknown]>) {
  const calls: Array<{ method: string; args: unknown[] }> = []

  type MockCommander = Record<string, jest.Mock>

  const commander: MockCommander = {}

  function makeMethod(method: string): jest.Mock {
    return jest.fn((...args: unknown[]) => {
      calls.push({ method, args })
      return commander
    })
  }

  commander.get = makeMethod('get')
  commander.set = makeMethod('set')
  commander.del = makeMethod('del')
  commander.zadd = makeMethod('zadd')
  commander.zrem = makeMethod('zrem')
  commander.zrange = makeMethod('zrange')
  commander.zrangebyscore = makeMethod('zrangebyscore')
  commander.zremrangebyscore = makeMethod('zremrangebyscore')
  commander.zscore = makeMethod('zscore')
  commander.exec = jest.fn(() => Promise.resolve(execResults))

  return { commander, calls }
}

/* ------------------------------------------------------------------ */
/*  Test models                                                        */
/* ------------------------------------------------------------------ */

const testSchema = z.object({ name: z.string(), value: z.number() })
type TestData = z.infer<typeof testSchema>

const TestModel: RedisModel<TestData, Buffer, [id: string]> = {
  namespace: 'test',
  version: 1,
  key: (id) => ['item', id],
  schema: testSchema,
  type: 'string',
  codec: new JsonCodec<TestData>(),
}

const TestModelWithTTL: RedisModel<TestData, Buffer, [id: string]> = {
  ...TestModel,
  ttl: 300,
}

const TestZSet: RedisZSetModel<[group: string]> = {
  namespace: 'test',
  version: 1,
  key: (group) => ['scores', group],
  type: 'zset',
}

/* ------------------------------------------------------------------ */
/*  PendingResult                                                      */
/* ------------------------------------------------------------------ */

describe('PendingResult', () => {
  it('throws when accessed before resolution', () => {
    const pr = new PendingResult<string>()
    expect(pr.resolved).toBe(false)
    expect(() => pr.value).toThrow('Pipeline has not been executed yet')
  })

  it('returns value after resolution', () => {
    const pr = new PendingResult<number>()
    pr._resolve(42)
    expect(pr.resolved).toBe(true)
    expect(pr.value).toBe(42)
  })

  it('throws stored error on access', () => {
    const pr = new PendingResult<string>()
    pr._reject(new Error('boom'))
    expect(pr.resolved).toBe(true)
    expect(() => pr.value).toThrow('boom')
  })
})

/* ------------------------------------------------------------------ */
/*  RedisPipeline — KV operations                                      */
/* ------------------------------------------------------------------ */

describe('RedisPipeline', () => {
  describe('kv.get', () => {
    it('decodes a stored model value', async () => {
      const data: TestData = { name: 'foo', value: 1 }
      const json = JSON.stringify(data)

      const { commander } = createMockCommander([[null, json]])
      const pipe = new RedisPipeline(commander as never)

      const result = pipe.kv.get(TestModel, 'abc')
      expect(result.resolved).toBe(false)

      await pipe.exec()

      expect(result.resolved).toBe(true)
      expect(result.value).toEqual(data)
      expect(commander.get).toHaveBeenCalledWith('test:v1:item:abc')
    })

    it('returns null for missing key', async () => {
      const { commander } = createMockCommander([[null, null]])
      const pipe = new RedisPipeline(commander as never)

      const result = pipe.kv.get(TestModel, 'missing')
      await pipe.exec()

      expect(result.value).toBeNull()
    })
  })

  describe('kv.set', () => {
    it('encodes and queues a SET command', async () => {
      const { commander } = createMockCommander([[null, 'OK']])
      const pipe = new RedisPipeline(commander as never)

      const result = pipe.kv.set(TestModel, { name: 'bar', value: 2 }, 'xyz')
      await pipe.exec()

      expect(result.value).toBe('OK')
      expect(commander.set).toHaveBeenCalledTimes(1)

      const setArgs = commander.set!.mock.calls[0]
      expect(setArgs[0]).toBe('test:v1:item:xyz')
      // second arg is the encoded Buffer
      expect(Buffer.isBuffer(setArgs[1])).toBe(true)
    })

    it('adds EX when model has ttl', async () => {
      const { commander } = createMockCommander([[null, 'OK']])
      const pipe = new RedisPipeline(commander as never)

      pipe.kv.set(TestModelWithTTL, { name: 'ttl', value: 3 }, 'id')
      await pipe.exec()

      const setArgs = commander.set!.mock.calls[0]
      expect(setArgs[2]).toBe('EX')
      expect(setArgs[3]).toBe(300)
    })
  })

  describe('kv.delete', () => {
    it('queues a DEL command', async () => {
      const { commander } = createMockCommander([[null, 1]])
      const pipe = new RedisPipeline(commander as never)

      const result = pipe.kv.delete(TestModel, 'del-me')
      await pipe.exec()

      expect(result.value).toBe(1)
      expect(commander.del).toHaveBeenCalledWith('test:v1:item:del-me')
    })
  })

  /* ---------------------------------------------------------------- */
  /*  ZSet operations                                                  */
  /* ---------------------------------------------------------------- */

  describe('zset.zadd', () => {
    it('queues a ZADD command', async () => {
      const { commander } = createMockCommander([[null, 1]])
      const pipe = new RedisPipeline(commander as never)

      const result = pipe.zset.zadd(TestZSet, 100, 'member-1', 'group-a')
      await pipe.exec()

      expect(result.value).toBe(1)
      expect(commander.zadd).toHaveBeenCalledWith('test:v1:scores:group-a', 100, 'member-1')
    })
  })

  describe('zset.zrange', () => {
    it('queues a ZRANGE command and returns string array', async () => {
      const { commander } = createMockCommander([[null, ['m1', 'm2']]])
      const pipe = new RedisPipeline(commander as never)

      const result = pipe.zset.zrange(TestZSet, 0, -1, 'group-a')
      await pipe.exec()

      expect(result.value).toEqual(['m1', 'm2'])
    })
  })

  describe('zset.zrem', () => {
    it('queues a ZREM command', async () => {
      const { commander } = createMockCommander([[null, 1]])
      const pipe = new RedisPipeline(commander as never)

      const result = pipe.zset.zrem(TestZSet, 'member-1', 'group-a')
      await pipe.exec()

      expect(result.value).toBe(1)
    })
  })

  describe('zset.zremrangebyscore', () => {
    it('queues a ZREMRANGEBYSCORE command', async () => {
      const { commander } = createMockCommander([[null, 3]])
      const pipe = new RedisPipeline(commander as never)

      const result = pipe.zset.zremrangebyscore(TestZSet, '-inf', 1000, 'group-a')
      await pipe.exec()

      expect(result.value).toBe(3)
      expect(commander.zremrangebyscore).toHaveBeenCalledWith(
        'test:v1:scores:group-a',
        '-inf',
        1000,
      )
    })
  })

  /* ---------------------------------------------------------------- */
  /*  Multiple operations                                              */
  /* ---------------------------------------------------------------- */

  describe('multiple operations', () => {
    it('handles batch of mixed kv and zset ops', async () => {
      const data1: TestData = { name: 'a', value: 1 }
      const data2: TestData = { name: 'b', value: 2 }

      const { commander } = createMockCommander([
        [null, JSON.stringify(data1)],
        [null, JSON.stringify(data2)],
        [null, 2], // zremrangebyscore
        [null, ['id-1', 'id-2']], // zrange
      ])
      const pipe = new RedisPipeline(commander as never)

      const r1 = pipe.kv.get(TestModel, 'id-1')
      const r2 = pipe.kv.get(TestModel, 'id-2')
      const cleaned = pipe.zset.zremrangebyscore(TestZSet, '-inf', 999, 'g')
      const ids = pipe.zset.zrange(TestZSet, 0, -1, 'g')

      expect(pipe.length).toBe(4)

      await pipe.exec()

      expect(r1.value).toEqual(data1)
      expect(r2.value).toEqual(data2)
      expect(cleaned.value).toBe(2)
      expect(ids.value).toEqual(['id-1', 'id-2'])
    })
  })

  /* ---------------------------------------------------------------- */
  /*  Error handling                                                    */
  /* ---------------------------------------------------------------- */

  describe('error handling', () => {
    it('rejects individual results when Redis returns per-command errors', async () => {
      const { commander } = createMockCommander([
        [null, JSON.stringify({ name: 'ok', value: 0 })],
        [new Error('WRONGTYPE'), null],
      ])
      const pipe = new RedisPipeline(commander as never)

      const good = pipe.kv.get(TestModel, '1')
      const bad = pipe.kv.get(TestModel, '2')

      await pipe.exec()

      expect(good.value).toEqual({ name: 'ok', value: 0 })
      expect(() => bad.value).toThrow('WRONGTYPE')
    })

    it('rejects results when decoding fails', async () => {
      const { commander } = createMockCommander([[null, 'not-valid-json!!']])
      const pipe = new RedisPipeline(commander as never)

      const result = pipe.kv.get(TestModel, '1')
      await pipe.exec()

      expect(() => result.value).toThrow()
    })

    it('throws when exec returns null', async () => {
      const { commander } = createMockCommander([])
      commander.exec = jest.fn(() => Promise.resolve(null))
      const pipe = new RedisPipeline(commander as never)

      pipe.kv.get(TestModel, '1')

      await expect(pipe.exec()).rejects.toThrow('Pipeline execution returned null')
    })

    it('throws on result count mismatch', async () => {
      const { commander } = createMockCommander([[null, 'x']])
      const pipe = new RedisPipeline(commander as never)

      pipe.kv.get(TestModel, '1')
      pipe.kv.get(TestModel, '2')

      await expect(pipe.exec()).rejects.toThrow('result count mismatch')
    })
  })

  /* ---------------------------------------------------------------- */
  /*  multi() semantics                                                */
  /* ---------------------------------------------------------------- */

  describe('multi (same API)', () => {
    it('works with a multi commander', async () => {
      const data: TestData = { name: 'tx', value: 99 }
      const { commander } = createMockCommander([
        [null, 'OK'],
        [null, JSON.stringify(data)],
      ])
      const pipe = new RedisPipeline(commander as never)

      const setResult = pipe.kv.set(TestModel, data, 'tx-id')
      const getResult = pipe.kv.get(TestModel, 'tx-id')

      await pipe.exec()

      expect(setResult.value).toBe('OK')
      expect(getResult.value).toEqual(data)
    })
  })
})
