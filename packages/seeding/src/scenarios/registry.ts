import type { SeedProfile, SeedScenario } from '../framework'
import { devSeedScenario } from './dev'
import { e2eSeedScenario } from './e2e'

export const seedScenarios: Record<SeedProfile, SeedScenario> = {
  dev: devSeedScenario,
  e2e: e2eSeedScenario,
}

export function getSeedScenario(profile: SeedProfile): SeedScenario {
  return seedScenarios[profile]
}
