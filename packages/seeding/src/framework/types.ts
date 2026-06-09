import type { KyselyDatabase } from '@repo/db'
import type { RedisClient } from '@repo/redis'
import type { TournaSeedFactories } from '../factories'
import type { SeedLogger } from '../runtime/logger'

export type SeedProfile = 'dev' | 'e2e'

export interface SeedState {
  set<T>(key: string, value: T): void
  get<T>(key: string): T
  getOptional<T>(key: string): T | undefined
  entries(): ReadonlyMap<string, unknown>
}

export interface SeedContext {
  profile: SeedProfile
  db: KyselyDatabase
  redis?: RedisClient
  factories: TournaSeedFactories
  logger: SeedLogger
  state: SeedState
}

export interface SeedStep {
  name: string
  run(context: SeedContext): Promise<void>
}

export interface SeedScenario {
  name: SeedProfile
  description: string
  steps: readonly SeedStep[]
}

export interface SeedRunOptions {
  logger?: SeedLogger
}

export interface SeedStepResult {
  name: string
  durationMs: number
}

export interface SeedRunResult {
  scenario: string
  steps: SeedStepResult[]
  durationMs: number
}
