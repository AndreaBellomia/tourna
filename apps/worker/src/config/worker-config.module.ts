import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { workerEnvSchema } from './env.schema'
import { WorkerConfigService } from './worker-config.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => workerEnvSchema.parse(env),
    }),
  ],
  providers: [WorkerConfigService],
  exports: [WorkerConfigService],
})
export class WorkerConfigModule {}
