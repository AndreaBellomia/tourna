import { Injectable, OnModuleDestroy } from '@nestjs/common'
import {
  createTournaTaskClient,
  type GenerateTournamentReportPayload,
  type RecalculateTournamentRatingsPayload,
  type SendEmailPayload,
  type TournaTaskClient,
  type TriggerTaskOptions,
} from '@repo/tasks'

@Injectable()
export class TaskProducerService implements OnModuleDestroy {
  private readonly client: TournaTaskClient = createTournaTaskClient()

  triggerSendEmail(payload: SendEmailPayload, options?: TriggerTaskOptions) {
    return this.client.notifications.sendEmail(payload, options)
  }

  triggerTournamentReport(payload: GenerateTournamentReportPayload, options?: TriggerTaskOptions) {
    const idempotencyKey =
      options?.idempotencyKey ?? `report:${payload.tournamentId}:${payload.format}`

    return this.client.reports.generateTournamentReport(payload, {
      ...options,
      idempotencyKey,
    })
  }

  triggerRatingsRecalculation(
    payload: RecalculateTournamentRatingsPayload,
    options?: TriggerTaskOptions,
  ) {
    const idempotencyKey =
      options?.idempotencyKey ?? `ratings:${payload.tournamentId}:${payload.reason}`

    return this.client.ratings.recalculateTournamentRatings(payload, {
      ...options,
      idempotencyKey,
    })
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close()
  }
}
