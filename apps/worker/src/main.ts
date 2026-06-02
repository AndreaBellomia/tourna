import 'reflect-metadata'
import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { WorkerModule } from './worker/worker.module'

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    bufferLogs: true,
  })

  app.useLogger(new Logger())
  app.flushLogs()
  app.enableShutdownHooks()

  const logger = new Logger('WorkerBootstrap')
  logger.log('Tourna worker started')
}

void bootstrap()
