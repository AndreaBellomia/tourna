import { z } from 'zod'
import { TOURNA_QUEUE_NAMES } from '../queue-names'

export const RECALCULATE_TOURNAMENT_RATINGS_JOB_NAME = 'ratings.recalculate-tournament.v1'

export const recalculateTournamentRatingsPayloadSchema = z.object({
  tournamentId: z.string().min(1),
  reason: z.enum(['match-result-recorded', 'manual-rebuild', 'migration']),
  requestedByUserId: z.string().min(1).optional(),
})

export type RecalculateTournamentRatingsPayload = z.infer<
  typeof recalculateTournamentRatingsPayloadSchema
>

export const recalculateTournamentRatingsJob = {
  queueName: TOURNA_QUEUE_NAMES.ratings,
  name: RECALCULATE_TOURNAMENT_RATINGS_JOB_NAME,
  schema: recalculateTournamentRatingsPayloadSchema,
  defaultJobOptions: {
    attempts: 4,
    backoff: {
      type: 'exponential',
      delay: 45_000,
    },
    removeOnComplete: {
      age: 60 * 60 * 24 * 7,
      count: 2_000,
    },
    removeOnFail: {
      age: 60 * 60 * 24 * 30,
      count: 10_000,
    },
  },
} as const
