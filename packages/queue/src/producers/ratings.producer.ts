import { recalculateTournamentRatingsJob, type RecalculateTournamentRatingsPayload } from '../jobs'
import { BaseQueueProducer, type EnqueueOptions, type QueuedJobReference } from './base.producer'

export class RatingsQueueProducer extends BaseQueueProducer {
  recalculateTournamentRatings(
    payload: RecalculateTournamentRatingsPayload,
    options: EnqueueOptions = {},
  ): Promise<QueuedJobReference> {
    return this.enqueue(recalculateTournamentRatingsJob, payload, options)
  }
}
