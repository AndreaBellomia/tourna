import { EmailVerificationTokenStore } from './email-verification.store'

function createMockClient() {
  const pipeline = {
    del: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  }

  return {
    client: {
      getBuffer: jest.fn(),
      multi: jest.fn(() => pipeline),
      del: jest.fn(),
    },
    pipeline,
  }
}

describe('EmailVerificationTokenStore', () => {
  it('stores token and user lookup keys with the same TTL', async () => {
    const { client, pipeline } = createMockClient()
    client.getBuffer.mockResolvedValue(null)
    const store = new EmailVerificationTokenStore(client as never)

    await store.create({
      userId: 'user-1',
      email: 'andrea@example.com',
      tokenHash: 'hash-1',
      ttlSeconds: 604800,
    })

    expect(client.getBuffer).toHaveBeenCalledWith('auth:v1:email_verification:user:user-1')
    expect(pipeline.set).toHaveBeenCalledWith(
      'auth:v1:email_verification:token:hash-1',
      expect.any(Buffer),
      'EX',
      604800,
    )
    expect(pipeline.set).toHaveBeenCalledWith(
      'auth:v1:email_verification:user:user-1',
      expect.any(Buffer),
      'EX',
      604800,
    )
    expect(pipeline.exec).toHaveBeenCalled()
  })

  it('removes the previous token when creating a replacement for the same user', async () => {
    const { client, pipeline } = createMockClient()
    client.getBuffer.mockResolvedValue(
      Buffer.from(
        JSON.stringify({
          userId: 'user-1',
          email: 'andrea@example.com',
          tokenHash: 'old-hash',
          createdAt: 1,
          expiresAt: 2,
        }),
      ),
    )
    const store = new EmailVerificationTokenStore(client as never)

    await store.create({
      userId: 'user-1',
      email: 'andrea@example.com',
      tokenHash: 'new-hash',
      ttlSeconds: 604800,
    })

    expect(pipeline.del).toHaveBeenCalledWith('auth:v1:email_verification:token:old-hash')
  })

  it('consumes a token and removes both indexes', async () => {
    const { client } = createMockClient()
    client.getBuffer.mockResolvedValue(
      Buffer.from(
        JSON.stringify({
          userId: 'user-1',
          email: 'andrea@example.com',
          tokenHash: 'hash-1',
          createdAt: 1,
          expiresAt: 2,
        }),
      ),
    )
    client.del.mockResolvedValue(2)
    const store = new EmailVerificationTokenStore(client as never)

    const result = await store.consume('hash-1')

    expect(result?.userId).toBe('user-1')
    expect(client.del).toHaveBeenCalledWith(
      'auth:v1:email_verification:token:hash-1',
      'auth:v1:email_verification:user:user-1',
    )
  })
})
