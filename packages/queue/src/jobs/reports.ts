import { z } from 'zod'
import { TOURNA_QUEUE_NAMES } from '../queue-names'

export const GENERATE_TOURNAMENT_REPORT_JOB_NAME = 'reports.generate-tournament-report.v1'

export const generateTournamentReportPayloadSchema = z.object({
  tournamentId: z.string().min(1),
  requestedByUserId: z.string().min(1),
  format: z.enum(['json', 'pdf', 'csv']).default('json'),
  locale: z.string().min(2).max(20).default('en'),
})

export type GenerateTournamentReportPayload = z.infer<typeof generateTournamentReportPayloadSchema>

export const generateTournamentReportJob = {
  queueName: TOURNA_QUEUE_NAMES.reports,
  name: GENERATE_TOURNAMENT_REPORT_JOB_NAME,
  schema: generateTournamentReportPayloadSchema,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 60_000,
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
