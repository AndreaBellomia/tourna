import { generateTournamentReportJob, type GenerateTournamentReportPayload } from '../jobs'
import { BaseQueueProducer, type EnqueueOptions, type QueuedJobReference } from './base.producer'

export class ReportsQueueProducer extends BaseQueueProducer {
  generateTournamentReport(
    payload: GenerateTournamentReportPayload,
    options: EnqueueOptions = {},
  ): Promise<QueuedJobReference> {
    return this.enqueue(generateTournamentReportJob, payload, options)
  }
}
