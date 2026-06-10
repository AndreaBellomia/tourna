import { logger } from '@trigger.dev/sdk'
import type { RecalculateTournamentRatingsPayload } from '@repo/tasks'

export function recalculateTournamentRatings(
  payload: RecalculateTournamentRatingsPayload,
): void {
  logger.info('Ratings recalculation task accepted', {
    tournamentId: payload.tournamentId,
    reason: payload.reason,
  })
}
