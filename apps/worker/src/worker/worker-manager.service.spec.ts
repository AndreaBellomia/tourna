import { WorkerManagerService } from './worker-manager.service'
import type { WorkerConfigService } from '../config/worker-config.service'
import type {
  MaintenanceProcessor,
  NotificationsProcessor,
  RatingsProcessor,
  ReportsProcessor,
} from '../processors'

jest.mock('bullmq', () => ({
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn(),
  })),
  QueueEvents: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn(),
  })),
}))

jest.mock(
  '@repo/queue',
  () => ({
    TOURNA_QUEUE_NAMES: {
      notifications: 'tourna.notifications',
      reports: 'tourna.reports',
      ratings: 'tourna.ratings',
      maintenance: 'tourna.maintenance',
    },
    TOURNA_CRON_JOBS: [
      {
        id: 'maintenance-heartbeat-every-15-minutes',
        queueName: 'tourna.maintenance',
        jobName: 'maintenance.heartbeat.v1',
        pattern: '*/15 * * * *',
      },
    ],
    createTournaQueueClient: jest.fn(() => ({
      getQueue: jest.fn(),
      close: jest.fn(),
    })),
    createWorkerOptions: jest.fn((connection: unknown, concurrency: number) => ({
      connection,
      concurrency,
    })),
    registerTournaCronJobs: jest.fn(),
  }),
  { virtual: true },
)

describe('WorkerManagerService', () => {
  it('registers workers without registering cron when disabled', async () => {
    const config = {
      getBullMqConnection: jest.fn(() => ({ host: 'localhost', port: 6379 })),
      getQueueConnectionSummary: jest.fn(() => ({
        host: 'localhost',
        port: 6379,
        db: 0,
        hasPassword: false,
      })),
      getConcurrency: jest.fn(() => ({
        notifications: 5,
        reports: 2,
        ratings: 2,
        maintenance: 1,
      })),
      shouldRegisterCron: jest.fn(() => false),
    } as unknown as WorkerConfigService

    const processor = { process: jest.fn() }
    const service = new WorkerManagerService(
      config,
      processor as unknown as NotificationsProcessor,
      processor as unknown as ReportsProcessor,
      processor as unknown as RatingsProcessor,
      processor as unknown as MaintenanceProcessor,
    )

    await service.onApplicationBootstrap()

    expect(config.getConcurrency).toHaveBeenCalled()
    expect(config.shouldRegisterCron).toHaveBeenCalled()
  })

  it('registers cron jobs when enabled', async () => {
    const queue = await import('@repo/queue')
    const close = jest.fn()

    jest.mocked(queue.createTournaQueueClient).mockReturnValueOnce({
      getQueue: jest.fn(),
      close,
    } as never)
    jest.mocked(queue.registerTournaCronJobs).mockResolvedValueOnce([
      {
        id: 'maintenance-heartbeat-every-15-minutes',
        queueName: 'tourna.maintenance',
        jobName: 'maintenance.heartbeat.v1',
        pattern: '*/15 * * * *',
        nextJobId: 'repeat:1',
        nextJobTimestamp: 1_771_999_200_000,
        nextJobDelay: 0,
      },
    ])

    const config = {
      getBullMqConnection: jest.fn(() => ({ host: 'localhost', port: 6379 })),
      getQueueConnectionSummary: jest.fn(() => ({
        host: 'localhost',
        port: 6379,
        db: 0,
        hasPassword: false,
      })),
      getConcurrency: jest.fn(() => ({
        notifications: 5,
        reports: 2,
        ratings: 2,
        maintenance: 1,
      })),
      shouldRegisterCron: jest.fn(() => true),
    } as unknown as WorkerConfigService

    const processor = { process: jest.fn() }
    const service = new WorkerManagerService(
      config,
      processor as unknown as NotificationsProcessor,
      processor as unknown as ReportsProcessor,
      processor as unknown as RatingsProcessor,
      processor as unknown as MaintenanceProcessor,
    )

    await service.onApplicationBootstrap()

    expect(queue.registerTournaCronJobs).toHaveBeenCalled()
    expect(close).toHaveBeenCalled()
  })
})
