import { schedules } from '@trigger.dev/sdk'
import {
  maintenanceHeartbeatTask,
  maintenanceStorageCleanupTask,
  TOURNA_TASK_SCHEDULES,
} from '@repo/tasks'
import {
  cleanupOrphanUploads,
  processMaintenanceHeartbeat,
} from '../src/handlers/maintenance'

const heartbeatSchedule = TOURNA_TASK_SCHEDULES.find(
  (schedule) => schedule.taskId === maintenanceHeartbeatTask.id,
)
const storageCleanupSchedule = TOURNA_TASK_SCHEDULES.find(
  (schedule) => schedule.taskId === maintenanceStorageCleanupTask.id,
)

if (!heartbeatSchedule || !storageCleanupSchedule) {
  throw new Error('Maintenance task schedules are not configured')
}

export const maintenanceHeartbeatTriggerTask = schedules.task({
  id: maintenanceHeartbeatTask.id,
  cron: {
    pattern: heartbeatSchedule.pattern,
    timezone: heartbeatSchedule.timezone,
    environments: getScheduleEnvironments(heartbeatSchedule),
  },
  retry: maintenanceHeartbeatTask.retry,
  queue: maintenanceHeartbeatTask.queue,
  maxDuration: maintenanceHeartbeatTask.maxDuration,
  run: async (payload) => {
    await Promise.resolve(
      processMaintenanceHeartbeat({
        source: 'scheduler',
        scheduledAt: payload.timestamp.toISOString(),
      }),
    )
  },
})

export const maintenanceStorageCleanupTriggerTask = schedules.task({
  id: maintenanceStorageCleanupTask.id,
  cron: {
    pattern: storageCleanupSchedule.pattern,
    timezone: storageCleanupSchedule.timezone,
    environments: getScheduleEnvironments(storageCleanupSchedule),
  },
  retry: maintenanceStorageCleanupTask.retry,
  queue: maintenanceStorageCleanupTask.queue,
  maxDuration: maintenanceStorageCleanupTask.maxDuration,
  run: async (payload) => {
    await cleanupOrphanUploads({
      source: 'scheduler',
      scheduledAt: payload.timestamp.toISOString(),
      limit: 100,
    })
  },
})

function getScheduleEnvironments(
  schedule: (typeof TOURNA_TASK_SCHEDULES)[number],
): Array<'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' | 'PREVIEW'> | undefined {
  return 'environments' in schedule
    ? (schedule.environments as Array<'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' | 'PREVIEW'>)
    : undefined
}
