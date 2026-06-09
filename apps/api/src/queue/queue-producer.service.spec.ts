import { QueueProducerService } from './queue-producer.service'
import type { AppConfigService } from '~/config/config.service'

jest.mock(
  '@repo/queue',
  () => {
    const producer = {
      notifications: {
        sendEmail: jest.fn(),
      },
      reports: {
        generateTournamentReport: jest.fn(),
      },
      ratings: {
        recalculateTournamentRatings: jest.fn(),
      },
      close: jest.fn(),
    }

    return {
      createBullMqConnection: jest.fn((config: unknown) => config),
      createTournaQueueClient: jest.fn(() => producer),
      __producer: producer,
    }
  },
  { virtual: true },
)

const queueModule: {
  __producer: {
    reports: {
      generateTournamentReport: jest.Mock
    }
    ratings: {
      recalculateTournamentRatings: jest.Mock
    }
    close: jest.Mock
  }
} = jest.requireMock('@repo/queue')

describe('QueueProducerService', () => {
  const config = {
    get: jest.fn((key: string) => {
      const values: Record<string, string | number> = {
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        REDIS_PASSWORD: '',
        REDIS_DB: 0,
      }

      return values[key]
    }),
  } as unknown as AppConfigService

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses deterministic report job ids when none is provided', async () => {
    const service = new QueueProducerService(config)

    await service.enqueueTournamentReport({
      tournamentId: 't-1',
      requestedByUserId: 'u-1',
      format: 'pdf',
      locale: 'en',
    })

    expect(queueModule.__producer.reports.generateTournamentReport).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        jobId: 'report:t-1:pdf',
      }),
    )
  })

  it('uses deterministic ratings job ids when none is provided', async () => {
    const service = new QueueProducerService(config)

    await service.enqueueRatingsRecalculation({
      tournamentId: 't-1',
      reason: 'manual-rebuild',
    })

    expect(queueModule.__producer.ratings.recalculateTournamentRatings).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        jobId: 'ratings:t-1:manual-rebuild',
      }),
    )
  })
})
