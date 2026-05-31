import type { ConnectionOptions, WorkerOptions } from 'bullmq'

export interface TournaQueueConnectionConfig {
  host: string
  port: number
  password?: string
  db: number
}

export interface TournaWorkerConcurrencyConfig {
  notifications: number
  reports: number
  ratings: number
  maintenance: number
}

export function createBullMqConnection(config: TournaQueueConnectionConfig): ConnectionOptions {
  return {
    host: config.host,
    port: config.port,
    password: config.password || undefined,
    db: config.db,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  }
}

export function createWorkerOptions(
  connection: ConnectionOptions,
  concurrency: number,
): WorkerOptions {
  return {
    connection,
    concurrency,
    autorun: true,
    stalledInterval: 30_000,
    maxStalledCount: 1,
  }
}
