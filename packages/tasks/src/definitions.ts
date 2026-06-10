import type { z } from 'zod'
import { maintenanceHeartbeatTask, maintenanceStorageCleanupTask } from './tasks/maintenance'
import { sendEmailTask } from './tasks/notifications'
import { recalculateTournamentRatingsTask } from './tasks/ratings'
import { generateTournamentReportTask } from './tasks/reports'
import type { TournaTaskQueueName } from './task-queues'

export interface TournaTaskRetryOptions {
  readonly maxAttempts: number
  readonly minTimeoutInMs: number
  readonly maxTimeoutInMs?: number
  readonly factor?: number
  readonly randomize?: boolean
}

export interface TournaTaskQueueOptions {
  readonly name: TournaTaskQueueName
  readonly concurrencyLimit?: number
}

export interface TournaTaskDefinition<TPayload> {
  readonly id: string
  readonly queue: TournaTaskQueueOptions
  readonly schema: z.ZodType<TPayload>
  readonly retry: TournaTaskRetryOptions
  readonly maxDuration?: number
  readonly machine?: 'micro' | 'small-1x' | 'small-2x' | 'medium-1x' | 'medium-2x' | 'large-1x' | 'large-2x'
}

export const TOURNA_TASK_DEFINITIONS = [
  sendEmailTask,
  generateTournamentReportTask,
  recalculateTournamentRatingsTask,
  maintenanceHeartbeatTask,
  maintenanceStorageCleanupTask,
] satisfies TournaTaskDefinition<unknown>[]

export type TournaTaskDefinitionItem = (typeof TOURNA_TASK_DEFINITIONS)[number]
export type TournaTaskId = TournaTaskDefinitionItem['id']
export type TournaTaskPayload<TId extends TournaTaskId> = z.infer<
  Extract<TournaTaskDefinitionItem, { id: TId }>['schema']
>

export function findTournaTaskDefinition(taskId: string): TournaTaskDefinitionItem | undefined {
  return TOURNA_TASK_DEFINITIONS.find((definition) => definition.id === taskId)
}

export function parseTournaTaskPayload<TId extends TournaTaskId>(
  taskId: TId,
  payload: unknown,
): TournaTaskPayload<TId>
export function parseTournaTaskPayload(taskId: string, payload: unknown): unknown
export function parseTournaTaskPayload(taskId: string, payload: unknown): unknown {
  const definition = findTournaTaskDefinition(taskId)

  if (!definition) {
    throw new Error(`Unknown Tourna task "${taskId}"`)
  }

  return definition.schema.parse(payload)
}
