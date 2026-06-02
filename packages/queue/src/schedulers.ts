import type { JobsOptions, RepeatOptions } from 'bullmq'
import type { TournaQueueClient } from './core/queue.client'
import { maintenanceHeartbeatJob, maintenanceStorageCleanupJob } from './jobs'
import type { TournaQueueName } from './queue-names'

export interface TournaCronJobDefinition {
  readonly id: string
  readonly queueName: TournaQueueName
  readonly jobName: string
  readonly pattern: string
  readonly defaultJobOptions: JobsOptions
  readonly getPayload: () => unknown
}

export interface RegisteredTournaCronJob {
  readonly id: string
  readonly queueName: TournaQueueName
  readonly jobName: string
  readonly pattern: string
  readonly nextJobId?: string
  readonly nextJobTimestamp?: number
  readonly nextJobDelay?: number
}

export const TOURNA_CRON_JOBS = [
  {
    id: 'maintenance-heartbeat-every-15-minutes',
    queueName: maintenanceHeartbeatJob.queueName,
    jobName: maintenanceHeartbeatJob.name,
    pattern: '*/15 * * * *',
    defaultJobOptions: maintenanceHeartbeatJob.defaultJobOptions,
    getPayload: () =>
      maintenanceHeartbeatJob.schema.parse({
        source: 'scheduler',
        scheduledAt: new Date().toISOString(),
      }),
  },
  {
    id: 'storage-cleanup-orphans-every-10-minutes',
    queueName: maintenanceStorageCleanupJob.queueName,
    jobName: maintenanceStorageCleanupJob.name,
    pattern: '*/10 * * * *',
    defaultJobOptions: maintenanceStorageCleanupJob.defaultJobOptions,
    getPayload: () =>
      maintenanceStorageCleanupJob.schema.parse({
        source: 'scheduler',
        scheduledAt: new Date().toISOString(),
        limit: 100,
      }),
  },
] satisfies TournaCronJobDefinition[]

export async function registerTournaCronJobs(
  client: TournaQueueClient,
): Promise<RegisteredTournaCronJob[]> {
  return Promise.all(
    TOURNA_CRON_JOBS.map(async (cronJob) => {
      const queue = client.getQueue(cronJob.queueName)

      const nextJob = await queue.upsertJobScheduler(
        cronJob.id,
        { pattern: cronJob.pattern, immediately: true } satisfies RepeatOptions,
        {
          name: cronJob.jobName,
          data: cronJob.getPayload(),
          opts: cronJob.defaultJobOptions,
        },
      )

      return {
        id: cronJob.id,
        queueName: cronJob.queueName,
        jobName: cronJob.jobName,
        pattern: cronJob.pattern,
        nextJobId: nextJob.id,
        nextJobTimestamp: nextJob.timestamp,
        nextJobDelay: nextJob.delay,
      }
    }),
  )
}
