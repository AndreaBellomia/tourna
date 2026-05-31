import { Injectable, Logger } from '@nestjs/common'
import {
  RECALCULATE_TOURNAMENT_RATINGS_JOB_NAME,
  recalculateTournamentRatingsPayloadSchema,
} from '@repo/queue'
import type { Job } from 'bullmq'

@Injectable()
export class RatingsProcessor {
  private readonly logger = new Logger(RatingsProcessor.name)

  process(job: Job): void {
    if (job.name !== RECALCULATE_TOURNAMENT_RATINGS_JOB_NAME) {
      throw new Error(`Unsupported ratings job "${job.name}"`)
    }

    const payload = recalculateTournamentRatingsPayloadSchema.parse(job.data)

    this.logger.log({
      message: 'Ratings recalculation job accepted by worker',
      jobId: job.id,
      tournamentId: payload.tournamentId,
      reason: payload.reason,
    })
  }
}
