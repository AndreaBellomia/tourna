import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  createBullMqConnection,
  type TournaQueueConnectionConfig,
  type TournaWorkerConcurrencyConfig,
} from '@repo/queue'
import type { ConnectionOptions } from 'bullmq'
import type { WorkerEnv } from './env.schema'

@Injectable()
export class WorkerConfigService {
  constructor(private readonly config: ConfigService<WorkerEnv, true>) {}

  get<K extends keyof WorkerEnv>(key: K): WorkerEnv[K] {
    return this.config.get(key, { infer: true })
  }

  getQueueConnectionConfig(): TournaQueueConnectionConfig {
    return {
      host: this.get('REDIS_HOST'),
      port: this.get('REDIS_PORT'),
      password: this.get('REDIS_PASSWORD'),
      db: this.get('REDIS_DB'),
    }
  }

  getBullMqConnection(): ConnectionOptions {
    return createBullMqConnection(this.getQueueConnectionConfig())
  }

  getConcurrency(): TournaWorkerConcurrencyConfig {
    return {
      notifications: this.get('WORKER_NOTIFICATIONS_CONCURRENCY'),
      reports: this.get('WORKER_REPORTS_CONCURRENCY'),
      ratings: this.get('WORKER_RATINGS_CONCURRENCY'),
      maintenance: this.get('WORKER_MAINTENANCE_CONCURRENCY'),
    }
  }

  shouldRegisterCron(): boolean {
    return this.get('WORKER_REGISTER_CRON')
  }
}
