import { z } from 'zod'

export const tournamentReportReadyEmailSchema = z.object({
  tournamentName: z.string().min(1).max(180),
  format: z.enum(['pdf', 'csv']),
  reportUrl: z.string().url(),
})

export type TournamentReportReadyEmailProps = z.infer<
  typeof tournamentReportReadyEmailSchema
>
