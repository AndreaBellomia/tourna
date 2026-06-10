import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common'
import { TOURNA_QUEUE_NAMES } from '@repo/queue'
import { Queue } from 'bullmq'
import express, {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from 'express'
import type { Server } from 'node:http'
import { timingSafeEqual } from 'node:crypto'
import { WorkerConfigService, type WorkerBullBoardConfig } from '~/config/worker-config.service'

@Injectable()
export class BullBoardService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(BullBoardService.name)
  private readonly queues: Queue[] = []
  private server?: Server

  constructor(private readonly config: WorkerConfigService) {}

  async onApplicationBootstrap(): Promise<void> {
    const boardConfig = this.config.getBullBoardConfig()

    if (!boardConfig.enabled) {
      return
    }

    const app = express()
    const serverAdapter = new ExpressAdapter()
    const authMiddleware = createBasicAuthMiddleware(boardConfig)

    serverAdapter.setBasePath(boardConfig.basePath)

    const bullBoardQueues = Object.values(TOURNA_QUEUE_NAMES).map((queueName) => {
      const queue = new Queue(queueName, {
        connection: this.config.getBullMqConnection(),
      })

      this.queues.push(queue)

      return new BullMQAdapter(queue, {
        readOnlyMode: boardConfig.readOnly,
      })
    })

    createBullBoard({
      queues: bullBoardQueues,
      serverAdapter,
      options: {
        uiConfig: {
          boardTitle: 'Tourna BullMQ',
          hideRedisDetails: !authMiddleware,
          sortQueues: true,
        },
      },
    })

    if (authMiddleware) {
      app.use(boardConfig.basePath, authMiddleware)
    }

    const bullBoardRouter = serverAdapter.getRouter() as unknown as RequestHandler

    app.use(boardConfig.basePath, bullBoardRouter)

    this.server = await listen(app, boardConfig.host, boardConfig.port)

    this.logger.log({
      message: 'Bull Board started',
      url: `http://${boardConfig.host}:${boardConfig.port}${boardConfig.basePath}`,
      readOnly: boardConfig.readOnly,
      basicAuthEnabled: Boolean(authMiddleware),
      queues: Object.values(TOURNA_QUEUE_NAMES),
    })
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([closeServer(this.server), ...this.queues.map((queue) => queue.close())])
  }
}

function createBasicAuthMiddleware(config: WorkerBullBoardConfig): RequestHandler | undefined {
  if (!config.username || !config.password) {
    return undefined
  }

  const expectedHeader = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString(
    'base64',
  )}`

  return (request: Request, response: Response, next: NextFunction): void => {
    const actualHeader = request.headers.authorization ?? ''

    if (safeEqual(actualHeader, expectedHeader)) {
      next()
      return
    }

    response.setHeader('WWW-Authenticate', 'Basic realm="Tourna BullMQ"')
    response.status(401).send('Authentication required')
  }
}

function safeEqual(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)

  return (
    actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
  )
}

function listen(app: express.Express, host: string, port: number): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, host)

    server.once('listening', () => resolve(server))
    server.once('error', reject)
  })
}

function closeServer(server: Server | undefined): Promise<void> {
  if (!server) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })
}
