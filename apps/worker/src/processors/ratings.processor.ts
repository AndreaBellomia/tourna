import { Injectable, Logger } from '@nestjs/common'
import {
  RECALCULATE_TOURNAMENT_RATINGS_JOB_NAME,
  recalculateTournamentRatingsPayloadSchema,
} from '@repo/queue'
import type { Job } from 'bullmq'
import { BaseWorkerProcessor, type WorkerProcessDefinition } from './processor.definition'

@Injectable()
export class RatingsProcessor extends BaseWorkerProcessor {
  private readonly logger = new Logger(RatingsProcessor.name)

  protected getProcessDefinitions(): Array<WorkerProcessDefinition> {
    return [
      {
        jobName: RECALCULATE_TOURNAMENT_RATINGS_JOB_NAME,
        run: (job) => {
          const payload = recalculateTournamentRatingsPayloadSchema.parse(job.data)

          this.logger.log({
            message: 'Ratings recalculation job accepted by worker',
            jobId: job.id,
            tournamentId: payload.tournamentId,
            reason: payload.reason,
          })
        },
      },
    ]
  }

  protected getUnsupportedJobErrorMessage(job: Job): string {
    return `Unsupported ratings job "${job.name}"`
  }
}
