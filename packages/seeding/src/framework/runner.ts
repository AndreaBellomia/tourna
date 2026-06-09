import { createTournaSeedFactories } from '../factories'
import { consoleSeedLogger } from '../runtime/logger'
import type { SeedContext, SeedRunOptions, SeedRunResult, SeedScenario, SeedState } from './types'

export async function runSeedScenario(
  scenario: SeedScenario,
  context: Omit<SeedContext, 'factories' | 'logger' | 'profile' | 'state'> &
    Partial<Pick<SeedContext, 'factories' | 'logger' | 'state'>>,
  options: SeedRunOptions = {},
): Promise<SeedRunResult> {
  const logger = options.logger ?? context.logger ?? consoleSeedLogger
  const seedContext: SeedContext = {
    ...context,
    profile: scenario.name,
    factories: context.factories ?? createTournaSeedFactories(),
    logger,
    state: context.state ?? createSeedState(),
  }

  const startedAt = performance.now()
  const steps = []

  logger.info(`running ${scenario.name} scenario`, { steps: scenario.steps.length })

  for (const step of scenario.steps) {
    const stepStartedAt = performance.now()
    logger.info(`starting step ${step.name}`)
    await step.run(seedContext)
    const durationMs = Math.round(performance.now() - stepStartedAt)
    steps.push({ name: step.name, durationMs })
    logger.info(`finished step ${step.name}`, { durationMs })
  }

  const durationMs = Math.round(performance.now() - startedAt)
  logger.info(`finished ${scenario.name} scenario`, { durationMs })

  return {
    scenario: scenario.name,
    steps,
    durationMs,
  }
}

export function createSeedState(initial?: Iterable<readonly [string, unknown]>): SeedState {
  const values = new Map(initial)

  return {
    set: (key, value) => {
      values.set(key, value)
    },
    get: (key) => {
      if (!values.has(key)) {
        throw new Error(`Seed state value "${key}" has not been set`)
      }

      return values.get(key) as never
    },
    getOptional: (key) => values.get(key) as never,
    entries: () => values,
  }
}
