import { logger } from '@trigger.dev/sdk'
import type { GenerateTournamentReportPayload } from '@repo/tasks'

export function generateTournamentReport(payload: GenerateTournamentReportPayload): void {
  logger.info('Tournament report task accepted', {
    tournamentId: payload.tournamentId,
    format: payload.format,
    requestedByUserId: payload.requestedByUserId,
  })
}
