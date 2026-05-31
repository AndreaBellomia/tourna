import { Injectable, Logger } from '@nestjs/common'
import {
  GENERATE_TOURNAMENT_REPORT_JOB_NAME,
  generateTournamentReportPayloadSchema,
} from '@repo/queue'
import type { Job } from 'bullmq'
import { BaseWorkerProcessor, type WorkerProcessDefinition } from './processor.definition'

@Injectable()
export class ReportsProcessor extends BaseWorkerProcessor {
  private readonly logger = new Logger(ReportsProcessor.name)

  protected getProcessDefinitions(): Array<WorkerProcessDefinition> {
    return [
      {
        jobName: GENERATE_TOURNAMENT_REPORT_JOB_NAME,
        run: (job) => {
          const payload = generateTournamentReportPayloadSchema.parse(job.data)

          this.logger.log({
            message: 'Tournament report job accepted by worker',
            jobId: job.id,
            tournamentId: payload.tournamentId,
            format: payload.format,
            requestedByUserId: payload.requestedByUserId,
          })
        },
      },
    ]
  }

  protected getUnsupportedJobErrorMessage(job: Job): string {
    return `Unsupported reports job "${job.name}"`
  }
}
