import { Test, TestingModule } from '@nestjs/testing'
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppController } from '~/app.controller'
import { AppService } from '~/app.service'

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile()

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  it('/health (GET)', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    })

    expect(response.statusCode).toBe(200)
    const body = response.json<{ status: string; timestamp: string }>()
    expect(body.status).toBe('ok')
    expect(typeof body.timestamp).toBe('string')
  })

  afterEach(async () => {
    await app.close()
  })
})
