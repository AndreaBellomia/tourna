import { schemaTask } from '@trigger.dev/sdk'
import {
  recalculateTournamentRatingsPayloadSchema,
  recalculateTournamentRatingsTask,
} from '@repo/tasks'
import { recalculateTournamentRatings } from '../src/handlers/ratings'

export const recalculateTournamentRatingsTriggerTask = schemaTask({
  id: recalculateTournamentRatingsTask.id,
  schema: recalculateTournamentRatingsPayloadSchema,
  retry: recalculateTournamentRatingsTask.retry,
  queue: recalculateTournamentRatingsTask.queue,
  maxDuration: recalculateTournamentRatingsTask.maxDuration,
  machine: recalculateTournamentRatingsTask.machine,
  run: async (payload) => {
    await Promise.resolve(recalculateTournamentRatings(payload))
  },
})
