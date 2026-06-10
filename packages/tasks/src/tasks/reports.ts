import { z } from 'zod'
import { TOURNA_TASK_QUEUES } from '../task-queues'

export const GENERATE_TOURNAMENT_REPORT_TASK_ID = 'reports.generate-tournament-report.v1'

export const generateTournamentReportPayloadSchema = z.object({
  tournamentId: z.string().min(1),
  requestedByUserId: z.string().min(1),
  format: z.enum(['json', 'pdf', 'csv']).default('json'),
  locale: z.string().min(2).max(20).default('en'),
})

export type GenerateTournamentReportPayload = z.infer<typeof generateTournamentReportPayloadSchema>

export const generateTournamentReportTask = {
  id: GENERATE_TOURNAMENT_REPORT_TASK_ID,
  queue: {
    name: TOURNA_TASK_QUEUES.reports,
    concurrencyLimit: 2,
  },
  schema: generateTournamentReportPayloadSchema,
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 60_000,
    factor: 2,
    randomize: true,
  },
  maxDuration: 15 * 60,
  machine: 'medium-1x',
} as const
