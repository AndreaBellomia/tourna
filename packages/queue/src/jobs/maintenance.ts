import { z } from 'zod'
import { TOURNA_QUEUE_NAMES } from '../queue-names'

export const MAINTENANCE_HEARTBEAT_JOB_NAME = 'maintenance.heartbeat.v1'
export const MAINTENANCE_STORAGE_CLEANUP_JOB_NAME = 'maintenance.storage.cleanup-orphans.v1'

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

export const maintenanceHeartbeatJob = {
  queueName: TOURNA_QUEUE_NAMES.maintenance,
  name: MAINTENANCE_HEARTBEAT_JOB_NAME,
  schema: maintenanceHeartbeatPayloadSchema,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 15_000,
    },
    removeOnComplete: {
      age: 60 * 60 * 24,
      count: 500,
    },
    removeOnFail: {
      age: 60 * 60 * 24 * 7,
      count: 2_000,
    },
  },
} as const

export const maintenanceStorageCleanupJob = {
  queueName: TOURNA_QUEUE_NAMES.maintenance,
  name: MAINTENANCE_STORAGE_CLEANUP_JOB_NAME,
  schema: maintenanceStorageCleanupPayloadSchema,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'fixed',
      delay: 30_000,
    },
    removeOnComplete: {
      age: 60 * 60 * 24,
      count: 500,
    },
    removeOnFail: {
      age: 60 * 60 * 24 * 7,
      count: 2_000,
    },
  },
} as const
