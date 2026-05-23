import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppConfigService } from './config/config.service'
import { AppModule } from './app.module'
import { cleanupOpenApiDoc } from 'nestjs-zod'

const logger = new Logger('Bootstrap')

export default async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())
  const config = app.get(AppConfigService)

  app.enableShutdownHooks()
  app.setGlobalPrefix(config.get('GLOBAL_PREFIX'))
  app.enableVersioning()

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('JWT + Refresh Token Auth System')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const openApiDoc = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('docs', app, cleanupOpenApiDoc(openApiDoc))

  const server = await app.listen(config.get('PORT'), config.get('HOST'))

  const address = server.address()
  if (!address || typeof address === 'string') return

  logger.log(
    `API is running on: http://${address.address}:${address.port}/${config.get('GLOBAL_PREFIX')}`,
  )
}
