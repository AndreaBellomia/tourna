import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from './app.controller'
import { AppService } from './app.service'

describe('AppController', () => {
  let appController: AppController
  const healthResult = { status: 'ok', timestamp: '2026-05-25T00:00:00.000Z' }

  const appServiceMock = {
    health: jest.fn(() => healthResult),
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appServiceMock }],
    }).compile()

    appController = app.get<AppController>(AppController)
  })

  it('returns health payload', () => {
    expect(appController.getHealth()).toEqual(healthResult)
    expect(appServiceMock.health).toHaveBeenCalledTimes(1)
  })
})
