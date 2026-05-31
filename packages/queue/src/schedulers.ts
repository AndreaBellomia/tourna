import type { RepeatOptions } from 'bullmq'
import type { TournaQueueClient } from './core/queue.client'
import { maintenanceHeartbeatJob } from './jobs'
import type { TournaQueueName } from './queue-names'

export interface TournaCronJobDefinition {
  readonly id: string
  readonly queueName: TournaQueueName
  readonly jobName: string
  readonly pattern: string
  readonly getPayload: () => unknown
}

export const TOURNA_CRON_JOBS = [
  {
    id: 'maintenance-heartbeat-every-15-minutes',
    queueName: maintenanceHeartbeatJob.queueName,
    jobName: maintenanceHeartbeatJob.name,
    pattern: '*/15 * * * *',
    getPayload: () =>
      maintenanceHeartbeatJob.schema.parse({
        source: 'scheduler',
        scheduledAt: new Date().toISOString(),
      }),
  },
] satisfies TournaCronJobDefinition[]

export async function registerTournaCronJobs(client: TournaQueueClient): Promise<void> {
  await Promise.all(
    TOURNA_CRON_JOBS.map((cronJob) => {
      const queue = client.getQueue(cronJob.queueName)

      return queue.upsertJobScheduler(
        cronJob.id,
        { pattern: cronJob.pattern } satisfies RepeatOptions,
        {
          name: cronJob.jobName,
          data: cronJob.getPayload(),
        },
      )
    }),
  )
}
