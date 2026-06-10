import { sendEmailTask, type SendEmailPayload } from '../tasks'
import {
  BaseTaskProducer,
  type TriggeredTaskRunReference,
  type TriggerTaskOptions,
} from './base.producer'

export class NotificationsTaskProducer extends BaseTaskProducer {
  sendEmail(
    payload: SendEmailPayload,
    options: TriggerTaskOptions = {},
  ): Promise<TriggeredTaskRunReference> {
    return this.trigger(sendEmailTask, payload, options)
  }
}
