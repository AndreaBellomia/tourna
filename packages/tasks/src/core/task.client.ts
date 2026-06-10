import { MaintenanceTaskProducer } from '../producers/maintenance.producer'
import { NotificationsTaskProducer } from '../producers/notifications.producer'
import { RatingsTaskProducer } from '../producers/ratings.producer'
import { ReportsTaskProducer } from '../producers/reports.producer'
import { TOURNA_TASK_QUEUES, type TournaTaskQueueName } from '../task-queues'

export class TournaTaskClient {
  readonly notifications: NotificationsTaskProducer
  readonly reports: ReportsTaskProducer
  readonly ratings: RatingsTaskProducer
  readonly maintenance: MaintenanceTaskProducer

  constructor() {
    this.notifications = new NotificationsTaskProducer(this)
    this.reports = new ReportsTaskProducer(this)
    this.ratings = new RatingsTaskProducer(this)
    this.maintenance = new MaintenanceTaskProducer(this)
  }

  close(): Promise<void> {
    return Promise.resolve()
  }
}

export function createTournaTaskClient(): TournaTaskClient {
  return new TournaTaskClient()
}

export function getTournaTaskQueueNames(): TournaTaskQueueName[] {
  return Object.values(TOURNA_TASK_QUEUES)
}
