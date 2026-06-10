import { maintenanceHeartbeatTask, maintenanceStorageCleanupTask } from './tasks'
import type { TournaTaskQueueName } from './task-queues'

export interface TournaTaskScheduleDefinition {
  readonly id: string
  readonly taskId: string
  readonly queueName: TournaTaskQueueName
  readonly pattern: string
  readonly timezone?: string
  readonly environments?: Array<'PRODUCTION' | 'STAGING' | 'PREVIEW' | 'DEVELOPMENT'>
}

export const TOURNA_TASK_SCHEDULES = [
  {
    id: 'maintenance-heartbeat-every-15-minutes',
    taskId: maintenanceHeartbeatTask.id,
    queueName: maintenanceHeartbeatTask.queue.name,
    pattern: '*/15 * * * *',
    timezone: 'UTC',
  },
  {
    id: 'storage-cleanup-orphans-every-10-minutes',
    taskId: maintenanceStorageCleanupTask.id,
    queueName: maintenanceStorageCleanupTask.queue.name,
    pattern: '*/10 * * * *',
    timezone: 'UTC',
  },
] satisfies TournaTaskScheduleDefinition[]
