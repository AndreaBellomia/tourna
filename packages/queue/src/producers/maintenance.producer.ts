import { maintenanceHeartbeatJob, type MaintenanceHeartbeatPayload } from '../jobs'
import { BaseQueueProducer, type EnqueueOptions, type QueuedJobReference } from './base.producer'

export class MaintenanceQueueProducer extends BaseQueueProducer {
  enqueueHeartbeat(
    payload: MaintenanceHeartbeatPayload,
    options: EnqueueOptions = {},
  ): Promise<QueuedJobReference> {
    return this.enqueue(maintenanceHeartbeatJob, payload, options)
  }
}
