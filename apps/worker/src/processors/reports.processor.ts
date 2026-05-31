import { Injectable, Logger } from '@nestjs/common'
import {
  GENERATE_TOURNAMENT_REPORT_JOB_NAME,
  generateTournamentReportPayloadSchema,
} from '@repo/queue'
import type { Job } from 'bullmq'

@Injectable()
export class ReportsProcessor {
  private readonly logger = new Logger(ReportsProcessor.name)

  process(job: Job): void {
    if (job.name !== GENERATE_TOURNAMENT_REPORT_JOB_NAME) {
      throw new Error(`Unsupported reports job "${job.name}"`)
    }

    const payload = generateTournamentReportPayloadSchema.parse(job.data)

    this.logger.log({
      message: 'Tournament report job accepted by worker',
      jobId: job.id,
      tournamentId: payload.tournamentId,
      format: payload.format,
      requestedByUserId: payload.requestedByUserId,
    })
  }
}
