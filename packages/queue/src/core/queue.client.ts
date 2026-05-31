import { Queue, type ConnectionOptions } from 'bullmq'
import { MaintenanceQueueProducer } from '../producers/maintenance.producer'
import { NotificationsQueueProducer } from '../producers/notifications.producer'
import { RatingsQueueProducer } from '../producers/ratings.producer'
import { ReportsQueueProducer } from '../producers/reports.producer'
import { TOURNA_QUEUE_NAMES, type TournaQueueName } from '../queue-names'

export class TournaQueueClient {
  readonly notifications: NotificationsQueueProducer
  readonly reports: ReportsQueueProducer
  readonly ratings: RatingsQueueProducer
  readonly maintenance: MaintenanceQueueProducer

  private readonly queues = new Map<TournaQueueName, Queue>()

  constructor(private readonly connection: ConnectionOptions) {
    this.notifications = new NotificationsQueueProducer(this)
    this.reports = new ReportsQueueProducer(this)
    this.ratings = new RatingsQueueProducer(this)
    this.maintenance = new MaintenanceQueueProducer(this)
  }

  async close(): Promise<void> {
    await Promise.all([...this.queues.values()].map((queue) => queue.close()))
  }

  getQueue(name: TournaQueueName): Queue {
    const existingQueue = this.queues.get(name)

    if (existingQueue) {
      return existingQueue
    }

    const queue = new Queue(name, {
      connection: this.connection,
      defaultJobOptions: {
        removeOnComplete: true,
      },
    })

    this.queues.set(name, queue)
    return queue
  }
}

export function createTournaQueueClient(connection: ConnectionOptions): TournaQueueClient {
  return new TournaQueueClient(connection)
}

export function getTournaQueueNames(): TournaQueueName[] {
  return Object.values(TOURNA_QUEUE_NAMES)
}
