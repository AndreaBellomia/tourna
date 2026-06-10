import { z } from 'zod'
import { TOURNA_TASK_QUEUES } from '../task-queues'

export const RECALCULATE_TOURNAMENT_RATINGS_TASK_ID = 'ratings.recalculate-tournament.v1'

export const recalculateTournamentRatingsPayloadSchema = z.object({
  tournamentId: z.string().min(1),
  reason: z.enum(['match-result-recorded', 'manual-rebuild', 'migration']),
  requestedByUserId: z.string().min(1).optional(),
})

export type RecalculateTournamentRatingsPayload = z.infer<
  typeof recalculateTournamentRatingsPayloadSchema
>

export const recalculateTournamentRatingsTask = {
  id: RECALCULATE_TOURNAMENT_RATINGS_TASK_ID,
  queue: {
    name: TOURNA_TASK_QUEUES.ratings,
    concurrencyLimit: 2,
  },
  schema: recalculateTournamentRatingsPayloadSchema,
  retry: {
    maxAttempts: 4,
    minTimeoutInMs: 45_000,
    factor: 2,
    randomize: true,
  },
  maxDuration: 10 * 60,
  machine: 'medium-1x',
} as const
