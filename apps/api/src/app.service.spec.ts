import { AppService } from './app.service'

describe('AppService', () => {
  let service: AppService

  beforeEach(() => {
    service = new AppService()
  })

  it('returns health payload with ok status', () => {
    const result = service.health()

    expect(result.status).toBe('ok')
    expect(result.timestamp).toBeDefined()
  })

  it('returns a valid ISO timestamp', () => {
    const result = service.health()
    const parsed = new Date(result.timestamp)

    expect(parsed.toISOString()).toBe(result.timestamp)
  })
})
