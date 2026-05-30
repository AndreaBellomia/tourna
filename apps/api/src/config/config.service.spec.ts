import { AppConfigService } from './config.service'
import { ConfigService } from '@nestjs/config'

describe('AppConfigService', () => {
  const configMock = {
    get: jest.fn(),
  } as unknown as ConfigService

  let service: AppConfigService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new AppConfigService(configMock as never)
  })

  it('delegates get calls to NestJS ConfigService with infer', () => {
    const getMock = configMock.get as jest.Mock
    getMock.mockReturnValue(3001)

    const result = service.get('PORT')

    expect(result).toBe(3001)
    expect(getMock).toHaveBeenCalledWith('PORT', { infer: true })
  })

  it('returns string config values', () => {
    const getMock = configMock.get as jest.Mock
    getMock.mockReturnValue('my-secret')

    const result = service.get('JWT_SECRET')

    expect(result).toBe('my-secret')
  })
})
