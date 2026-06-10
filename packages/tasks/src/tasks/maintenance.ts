import { z } from 'zod'
import { TOURNA_TASK_QUEUES } from '../task-queues'

export const MAINTENANCE_HEARTBEAT_TASK_ID = 'maintenance.heartbeat.v1'
export const MAINTENANCE_STORAGE_CLEANUP_TASK_ID = 'maintenance.storage.cleanup-orphans.v1'

export const maintenanceHeartbeatPayloadSchema = z.object({
  source: z.literal('scheduler'),
  scheduledAt: z.string().datetime(),
})

export type MaintenanceHeartbeatPayload = z.infer<typeof maintenanceHeartbeatPayloadSchema>

export const maintenanceStorageCleanupPayloadSchema = z.object({
  source: z.literal('scheduler'),
  scheduledAt: z.string().datetime(),
  limit: z.number().int().positive().max(1_000).default(100),
})

export type MaintenanceStorageCleanupPayload = z.infer<
  typeof maintenanceStorageCleanupPayloadSchema
>

export const maintenanceHeartbeatTask = {
  id: MAINTENANCE_HEARTBEAT_TASK_ID,
  queue: {
    name: TOURNA_TASK_QUEUES.maintenance,
    concurrencyLimit: 1,
  },
  schema: maintenanceHeartbeatPayloadSchema,
  retry: {
    maxAttempts: 2,
    minTimeoutInMs: 15_000,
    factor: 1,
    randomize: false,
  },
  maxDuration: 60,
} as const

export const maintenanceStorageCleanupTask = {
  id: MAINTENANCE_STORAGE_CLEANUP_TASK_ID,
  queue: {
    name: TOURNA_TASK_QUEUES.maintenance,
    concurrencyLimit: 1,
  },
  schema: maintenanceStorageCleanupPayloadSchema,
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 30_000,
    factor: 1,
    randomize: false,
  },
  maxDuration: 5 * 60,
} as const
