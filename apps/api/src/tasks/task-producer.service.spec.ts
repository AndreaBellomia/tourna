import { TaskProducerService } from './task-producer.service'
import type { TournaTaskClient } from '@repo/tasks'

describe('TaskProducerService', () => {
  const client = {
    reports: {
      generateTournamentReport: jest.fn(),
    },
    ratings: {
      recalculateTournamentRatings: jest.fn(),
    },
    notifications: {
      sendEmail: jest.fn(),
    },
    maintenance: {
      triggerHeartbeat: jest.fn(),
    },
    close: jest.fn(),
  } as unknown as TournaTaskClient

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses deterministic report idempotency keys when none is provided', async () => {
    const service = new TaskProducerService(client)

    await service.triggerTournamentReport({
      tournamentId: 't-1',
      requestedByUserId: 'u-1',
      format: 'pdf',
      locale: 'en',
    })

    expect(client.reports.generateTournamentReport).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        idempotencyKey: 'report:t-1:pdf',
      }),
    )
  })

  it('uses deterministic ratings idempotency keys when none is provided', async () => {
    const service = new TaskProducerService(client)

    await service.triggerRatingsRecalculation({
      tournamentId: 't-1',
      reason: 'manual-rebuild',
    })

    expect(client.ratings.recalculateTournamentRatings).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        idempotencyKey: 'ratings:t-1:manual-rebuild',
      }),
    )
  })
})
