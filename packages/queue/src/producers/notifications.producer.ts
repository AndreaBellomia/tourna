import { sendEmailJob, type SendEmailPayload } from '../jobs'
import { BaseQueueProducer, type EnqueueOptions, type QueuedJobReference } from './base.producer'

export class NotificationsQueueProducer extends BaseQueueProducer {
  sendEmail(payload: SendEmailPayload, options: EnqueueOptions = {}): Promise<QueuedJobReference> {
    return this.enqueue(sendEmailJob, payload, options)
  }
}
