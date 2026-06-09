import { getSeedScenario, runSeedScenario } from '.'
import { createSeedRuntimeConnections } from './runtime'
import type { SeedProfile } from './framework'

const profiles = ['dev', 'e2e'] as const

async function main() {
  const requestedProfile = process.argv[2]

  if (!isSeedProfile(requestedProfile)) {
    throw new Error(`Usage: tsx src/cli.ts <${profiles.join('|')}>`)
  }

  const connections = createSeedRuntimeConnections()

  try {
    await runSeedScenario(getSeedScenario(requestedProfile), {
      db: connections.db,
      redis: connections.redis,
    })
  } finally {
    await connections.destroy()
  }
}

function isSeedProfile(value: string | undefined): value is SeedProfile {
  return profiles.includes(value as SeedProfile)
}

void main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
