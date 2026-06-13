import { createRedisClient } from '../../client/redis.client'
import { EmailVerificationTokenStore } from './email-verification.store'
import { createRedisTestEnvironment, type TestRedisEnvironment } from '../../testing'

describe('EmailVerificationTokenStore integration', () => {
  let environment: TestRedisEnvironment
  let store: EmailVerificationTokenStore

  beforeAll(async () => {
    environment = await createRedisTestEnvironment({
      runId: 'email-verification-store',
    })
    store = new EmailVerificationTokenStore(environment.client)
  })

  afterEach(async () => {
    await environment.reset()
  })

  afterAll(async () => {
    await environment?.destroy()
  })

  it('stores, replaces, and consumes email verification tokens in real Redis', async () => {
    await store.create({
      userId: 'user-1',
      email: 'andrea@example.com',
      tokenHash: 'old-token-hash',
      ttlSeconds: 60,
    })
    await store.create({
      userId: 'user-1',
      email: 'andrea@example.com',
      tokenHash: 'new-token-hash',
      ttlSeconds: 60,
    })

    await expect(store.getByTokenHash('old-token-hash')).resolves.toBeNull()
    await expect(store.getByUserId('user-1')).resolves.toMatchObject({
      userId: 'user-1',
      email: 'andrea@example.com',
      tokenHash: 'new-token-hash',
    })

    await expect(store.consume('new-token-hash')).resolves.toMatchObject({
      userId: 'user-1',
      email: 'andrea@example.com',
      tokenHash: 'new-token-hash',
    })
    await expect(store.getByUserId('user-1')).resolves.toBeNull()
  })

  it('resets only keys that belong to the test prefix', async () => {
    const rawClient = createRedisClient({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
      password: process.env.REDIS_PASSWORD ?? '',
      db: Number(process.env.REDIS_TEST_DB ?? process.env.REDIS_DB ?? 0),
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    })
    const externalKey = 'tourna:developer:safety-check'

    try {
      await rawClient.set(externalKey, 'keep-me')
      await environment.client.set('ephemeral-key', 'delete-me')

      await environment.reset()

      await expect(environment.client.get('ephemeral-key')).resolves.toBeNull()
      await expect(rawClient.get(externalKey)).resolves.toBe('keep-me')
    } finally {
      await rawClient.del(externalKey)
      await rawClient.quit()
    }
  })
})
