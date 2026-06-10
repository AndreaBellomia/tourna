import { defineConfig } from '@trigger.dev/sdk'

const project = process.env.TRIGGER_PROJECT_REF
const apiUrl = process.env.TRIGGER_API_URL

if (!project) {
  throw new Error(
    'TRIGGER_PROJECT_REF is required to run or deploy Tourna Trigger.dev tasks. Use tourna-local for local self-hosted development.',
  )
}

if (!apiUrl) {
  throw new Error(
    'TRIGGER_API_URL is required so Tourna tasks target the self-hosted Trigger.dev instance. Local default is http://localhost:8030.',
  )
}

if (apiUrl.includes('api.trigger.dev')) {
  throw new Error('Tourna Trigger.dev tasks must target the self-hosted API, not Trigger.dev Cloud.')
}

export default defineConfig({
  project,
  dirs: ['./trigger'],
  tsconfig: './tsconfig.json',
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 30_000,
      factor: 2,
      randomize: true,
    },
  },
  machine: 'small-1x',
  maxDuration: 30 * 60,
  ttl: '1h',
  enableConsoleLogging: process.env.NODE_ENV !== 'production',
})
