import type { JobsOptions } from 'bullmq'
import type { z } from 'zod'
import { maintenanceHeartbeatJob } from './jobs/maintenance'
import { sendEmailJob } from './jobs/notifications'
import { recalculateTournamentRatingsJob } from './jobs/ratings'
import { generateTournamentReportJob } from './jobs/reports'
import type { TournaQueueName } from './queue-names'

export interface TournaJobDefinition<TPayload> {
  readonly queueName: TournaQueueName
  readonly name: string
  readonly schema: z.ZodType<TPayload>
  readonly defaultJobOptions: JobsOptions
}

export const TOURNA_JOB_DEFINITIONS = [
  sendEmailJob,
  generateTournamentReportJob,
  recalculateTournamentRatingsJob,
  maintenanceHeartbeatJob,
] satisfies TournaJobDefinition<unknown>[]

export type TournaJobDefinitionItem = (typeof TOURNA_JOB_DEFINITIONS)[number]
export type TournaJobName = TournaJobDefinitionItem['name']
export type TournaJobPayload<TName extends TournaJobName> = z.infer<
  Extract<TournaJobDefinitionItem, { name: TName }>['schema']
>

export function findTournaJobDefinition(jobName: string): TournaJobDefinitionItem | undefined {
  return TOURNA_JOB_DEFINITIONS.find((definition) => definition.name === jobName)
}

export function parseTournaJobPayload<TName extends TournaJobName>(
  jobName: TName,
  payload: unknown,
): TournaJobPayload<TName>
export function parseTournaJobPayload(jobName: string, payload: unknown): unknown
export function parseTournaJobPayload(jobName: string, payload: unknown): unknown {
  const definition = findTournaJobDefinition(jobName)

  if (!definition) {
    throw new Error(`Unknown Tourna job "${jobName}"`)
  }

  return definition.schema.parse(payload)
}
