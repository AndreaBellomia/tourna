import { tasks } from '@trigger.dev/sdk'
import type { TournaTaskClient } from '../core/task.client'
import type { TournaTaskDefinition } from '../definitions'
import type { TournaTaskQueueName } from '../task-queues'

type TriggerRunOptions = Parameters<typeof tasks.trigger>[2]

export interface TriggerTaskOptions {
  idempotencyKey?: string
  idempotencyKeyTTL?: string | number
  delay?: string | number | Date
  priority?: number
  ttl?: string | number
  tags?: string[]
  metadata?: Record<string, unknown>
}

export interface TriggeredTaskRunReference {
  id: string
  runId?: string
  taskId: string
  queueName: TournaTaskQueueName
}

export abstract class BaseTaskProducer {
  constructor(protected readonly client: TournaTaskClient) {}

  protected async trigger<TPayload>(
    definition: TournaTaskDefinition<TPayload>,
    payload: TPayload,
    options: TriggerTaskOptions = {},
  ): Promise<TriggeredTaskRunReference> {
    const data = definition.schema.parse(payload)
    const handle = await tasks.trigger(definition.id, data, this.toTriggerOptions(options))

    return {
      id: handle.id,
      runId: handle.id,
      taskId: definition.id,
      queueName: definition.queue.name,
    }
  }

  private toTriggerOptions(options: TriggerTaskOptions): TriggerRunOptions {
    return {
      idempotencyKey: options.idempotencyKey,
      idempotencyKeyTTL: options.idempotencyKeyTTL,
      delay: this.toTriggerDelay(options.delay),
      priority: options.priority,
      ttl: options.ttl,
      tags: options.tags,
      metadata: options.metadata,
    } as TriggerRunOptions
  }

  private toTriggerDelay(delay: TriggerTaskOptions['delay']): string | Date | undefined {
    if (typeof delay !== 'number') {
      return delay
    }

    return `${Math.max(1, Math.ceil(delay / 1000))}s`
  }
}
