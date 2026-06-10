import { recalculateTournamentRatingsTask, type RecalculateTournamentRatingsPayload } from '../tasks'
import {
  BaseTaskProducer,
  type TriggeredTaskRunReference,
  type TriggerTaskOptions,
} from './base.producer'

export class RatingsTaskProducer extends BaseTaskProducer {
  recalculateTournamentRatings(
    payload: RecalculateTournamentRatingsPayload,
    options: TriggerTaskOptions = {},
  ): Promise<TriggeredTaskRunReference> {
    return this.trigger(recalculateTournamentRatingsTask, payload, options)
  }
}
