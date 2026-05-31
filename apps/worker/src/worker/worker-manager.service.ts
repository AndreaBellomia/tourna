import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common'
import {
  createTournaQueueClient,
  createWorkerOptions,
  registerTournaCronJobs,
  TOURNA_QUEUE_NAMES,
  type TournaQueueName,
} from '@repo/queue'
import { QueueEvents, Worker, type Job } from 'bullmq'
import { WorkerConfigService } from '../config/worker-config.service'
import {
  MaintenanceProcessor,
  NotificationsProcessor,
  RatingsProcessor,
  ReportsProcessor,
} from '../processors'

@Injectable()
export class WorkerManagerService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(WorkerManagerService.name)
  private readonly workers: Worker[] = []
  private readonly queueEvents: QueueEvents[] = []

  constructor(
    private readonly config: WorkerConfigService,
    private readonly notificationsProcessor: NotificationsProcessor,
    private readonly reportsProcessor: ReportsProcessor,
    private readonly ratingsProcessor: RatingsProcessor,
    private readonly maintenanceProcessor: MaintenanceProcessor,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const connection = this.config.getBullMqConnection()
    const concurrency = this.config.getConcurrency()

    this.registerWorker(
      TOURNA_QUEUE_NAMES.notifications,
      concurrency.notifications,
      async (job) => {
        await Promise.resolve(this.notificationsProcessor.process(job))
      },
    )
    this.registerWorker(TOURNA_QUEUE_NAMES.reports, concurrency.reports, async (job) => {
      await Promise.resolve(this.reportsProcessor.process(job))
    })
    this.registerWorker(TOURNA_QUEUE_NAMES.ratings, concurrency.ratings, async (job) => {
      await Promise.resolve(this.ratingsProcessor.process(job))
    })
    this.registerWorker(TOURNA_QUEUE_NAMES.maintenance, concurrency.maintenance, async (job) => {
      await Promise.resolve(this.maintenanceProcessor.process(job))
    })

    if (this.config.shouldRegisterCron()) {
      const client = createTournaQueueClient(connection)

      try {
        await registerTournaCronJobs(client)
        this.logger.log('BullMQ cron jobs registered')
      } finally {
        await client.close()
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([
      ...this.workers.map((worker) => worker.close()),
      ...this.queueEvents.map((events) => events.close()),
    ])
  }

  private registerWorker(
    queueName: TournaQueueName,
    concurrency: number,
    processor: (job: Job) => Promise<void>,
  ): void {
    const connection = this.config.getBullMqConnection()
    const worker = new Worker(queueName, processor, createWorkerOptions(connection, concurrency))
    const events = new QueueEvents(queueName, { connection })

    worker.on('completed', (job) => {
      this.logger.log({
        message: 'Job completed',
        queueName,
        jobName: job.name,
        jobId: job.id,
      })
    })

    worker.on('failed', (job, error) => {
      this.logger.error(
        {
          message: 'Job failed',
          queueName,
          jobName: job?.name,
          jobId: job?.id,
          error: error.message,
        },
        error.stack,
      )
    })

    events.on('stalled', ({ jobId }) => {
      this.logger.warn({
        message: 'Job stalled',
        queueName,
        jobId,
      })
    })

    this.workers.push(worker)
    this.queueEvents.push(events)
    this.logger.log({ message: 'BullMQ worker registered', queueName, concurrency })
  }
}
