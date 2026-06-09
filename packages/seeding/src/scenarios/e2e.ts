import { createTournamentFixtureScenario } from './dev'

export const e2eSeedScenario = createTournamentFixtureScenario({
  name: 'e2e',
  description: 'Small deterministic tournament fixture for future e2e tests.',
  prefix: 'e2e',
  users: 4,
  teams: 2,
  tags: 1,
})
