import { createTournaSeedFactories } from './table-factories'

describe('Tourna seed factories', () => {
  it('builds deterministic user data and supports overrides', () => {
    const factories = createTournaSeedFactories()

    const first = factories.user.build()
    const second = factories.user.build({ email: 'custom@example.test' })

    expect(first).toMatchObject({
      email: 'player-01@tourna.test',
      nickname: 'player-01',
    })
    expect(second.email).toBe('custom@example.test')
    expect(second.nickname).toBe('player-02')
  })

  it('can reset factory sequences', () => {
    const factories = createTournaSeedFactories()

    const first = factories.team.build()
    factories.team.reset()

    expect(factories.team.build().slug).toBe(first.slug)
  })
})
