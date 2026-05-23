import { jwtPayloadSchema } from './jwt.payload'

describe('jwtPayloadSchema', () => {
  it('accepts payload with userId and sessionId', () => {
    const parsed = jwtPayloadSchema.parse({
      userId: 'u-1',
      sessionId: 's-1',
    })

    expect(parsed).toEqual({
      userId: 'u-1',
      sessionId: 's-1',
    })
  })

  it('rejects payload when sessionId is missing', () => {
    const parsed = jwtPayloadSchema.safeParse({
      userId: 'u-1',
    })

    expect(parsed.success).toBe(false)
  })
})
