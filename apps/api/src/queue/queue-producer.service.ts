import { Injectable, OnModuleDestroy } from '@nestjs/common'
import {
  createBullMqConnection,
  createTournaQueueClient,
  type EnqueueOptions,
  type GenerateTournamentReportPayload,
  type RecalculateTournamentRatingsPayload,
  type SendEmailPayload,
  type TournaQueueClient,
} from '@repo/queue'
import { AppConfigService } from '../config/config.service'

@Injectable()
export class QueueProducerService implements OnModuleDestroy {
  private readonly client: TournaQueueClient

  constructor(config: AppConfigService) {
    this.client = createTournaQueueClient(
      createBullMqConnection({
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
        password: config.get('REDIS_PASSWORD'),
        db: config.get('REDIS_DB'),
      }),
    )
  }

  enqueueSendEmail(payload: SendEmailPayload, options?: EnqueueOptions) {
    return this.client.notifications.sendEmail(payload, options)
  }

  enqueueTournamentReport(payload: GenerateTournamentReportPayload, options?: EnqueueOptions) {
    const jobId = options?.jobId ?? `report:${payload.tournamentId}:${payload.format}`

    return this.client.reports.generateTournamentReport(payload, {
      ...options,
      jobId,
    })
  }

  enqueueRatingsRecalculation(
    payload: RecalculateTournamentRatingsPayload,
    options?: EnqueueOptions,
  ) {
    const jobId = options?.jobId ?? `ratings:${payload.tournamentId}:${payload.reason}`

    return this.client.ratings.recalculateTournamentRatings(payload, {
      ...options,
      jobId,
    })
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close()
  }
}
