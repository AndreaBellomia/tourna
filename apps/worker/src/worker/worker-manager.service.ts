import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common'
import {
  createTournaQueueClient,
  createWorkerOptions,
  registerTournaCronJobs,
  TOURNA_QUEUE_NAMES,
  TOURNA_CRON_JOBS,
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
    const shouldRegisterCron = this.config.shouldRegisterCron()

    this.logger.log({
      message: 'BullMQ worker bootstrap starting',
      redis: this.config.getQueueConnectionSummary(),
      concurrency,
      shouldRegisterCron,
      cronJobCount: TOURNA_CRON_JOBS.length,
    })

    this.registerWorker(
      TOURNA_QUEUE_NAMES.notifications,
      concurrency.notifications,
      async (job) => {
        await this.notificationsProcessor.process(job)
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

    if (shouldRegisterCron) {
      const client = createTournaQueueClient(connection)

      try {
        const registeredCronJobs = await registerTournaCronJobs(client)
        this.logger.log({
          message: 'BullMQ cron jobs registered',
          cronJobs: registeredCronJobs,
        })
      } finally {
        await client.close()
      }
    } else {
      this.logger.warn({
        message: 'BullMQ cron registration skipped',
        reason: 'WORKER_REGISTER_CRON is false',
        expectedCronJobs: TOURNA_CRON_JOBS.map((cronJob) => ({
          id: cronJob.id,
          queueName: cronJob.queueName,
          jobName: cronJob.jobName,
          pattern: cronJob.pattern,
        })),
      })
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

    worker.on('active', (job) => {
      this.logger.log({
        message: 'Job execution started',
        queueName,
        jobName: job.name,
        jobId: job.id,
        attemptsMade: job.attemptsMade,
        timestamp: job.timestamp,
      })
    })

    worker.on('completed', (job) => {
      this.logger.log({
        message: 'Job completed',
        queueName,
        jobName: job.name,
        jobId: job.id,
        attemptsMade: job.attemptsMade,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
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

    events.on('waiting', ({ jobId }) => {
      this.logger.log({
        message: 'Job waiting',
        queueName,
        jobId,
      })
    })

    events.on('delayed', ({ jobId, delay }) => {
      this.logger.log({
        message: 'Job delayed',
        queueName,
        jobId,
        delay,
      })
    })

    this.workers.push(worker)
    this.queueEvents.push(events)
    this.logger.log({ message: 'BullMQ worker registered', queueName, concurrency })
  }
}
