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
})
