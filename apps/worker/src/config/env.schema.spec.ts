import { workerEnvSchema } from './env.schema'

describe('workerEnvSchema', () => {
  it('parses string booleans without enabling optional services accidentally', () => {
    const env = workerEnvSchema.parse({
      WORKER_REGISTER_CRON: 'false',
      WORKER_BULL_BOARD_ENABLED: 'false',
      WORKER_BULL_BOARD_READ_ONLY: 'true',
    })

    expect(env.WORKER_REGISTER_CRON).toBe(false)
    expect(env.WORKER_BULL_BOARD_ENABLED).toBe(false)
    expect(env.WORKER_BULL_BOARD_READ_ONLY).toBe(true)
  })

  it('allows empty Bull Board credentials when the dashboard is localhost-only', () => {
    const env = workerEnvSchema.parse({
      WORKER_BULL_BOARD_ENABLED: 'true',
      WORKER_BULL_BOARD_HOST: '127.0.0.1',
      WORKER_BULL_BOARD_USERNAME: '',
      WORKER_BULL_BOARD_PASSWORD: '',
    })

    expect(env.WORKER_BULL_BOARD_USERNAME).toBeUndefined()
    expect(env.WORKER_BULL_BOARD_PASSWORD).toBeUndefined()
  })

  it('requires Bull Board credentials outside localhost', () => {
    expect(() =>
      workerEnvSchema.parse({
        WORKER_BULL_BOARD_ENABLED: 'true',
        WORKER_BULL_BOARD_HOST: '0.0.0.0',
      }),
    ).toThrow('Bull Board requires WORKER_BULL_BOARD_USERNAME')
  })
})
