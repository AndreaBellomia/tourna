import { maintenanceHeartbeatTask, type MaintenanceHeartbeatPayload } from '../tasks'
import {
  BaseTaskProducer,
  type TriggeredTaskRunReference,
  type TriggerTaskOptions,
} from './base.producer'

export class MaintenanceTaskProducer extends BaseTaskProducer {
  triggerHeartbeat(
    payload: MaintenanceHeartbeatPayload,
    options: TriggerTaskOptions = {},
  ): Promise<TriggeredTaskRunReference> {
    return this.trigger(maintenanceHeartbeatTask, payload, options)
  }
}
