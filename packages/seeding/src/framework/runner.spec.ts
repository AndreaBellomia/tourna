import { silentSeedLogger } from '../runtime/logger'
import { runSeedScenario } from './runner'
import type { SeedScenario } from './types'

describe('runSeedScenario', () => {
  it('runs steps in order and shares seed state', async () => {
    const calls: string[] = []
    const scenario: SeedScenario = {
      name: 'e2e',
      description: 'test scenario',
      steps: [
        {
          name: 'first',
          run: (context) => {
            context.state.set('value', 1)
            calls.push('first')
            return Promise.resolve()
          },
        },
        {
          name: 'second',
          run: (context) => {
            calls.push(`second:${context.state.get<number>('value')}`)
            return Promise.resolve()
          },
        },
      ],
    }

    const result = await runSeedScenario(
      scenario,
      {
        db: {} as never,
      },
      {
        logger: silentSeedLogger,
      },
    )

    expect(calls).toEqual(['first', 'second:1'])
    expect(result.steps.map((step) => step.name)).toEqual(['first', 'second'])
  })
})
