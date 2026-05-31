import type { JobsOptions } from 'bullmq'
import type { TournaJobDefinition } from '../definitions'
import type { TournaQueueClient } from '../core/queue.client'
import type { TournaQueueName } from '../queue-names'

export interface EnqueueOptions {
  jobId?: string
  delay?: number
  priority?: number
}

export interface QueuedJobReference {
  id?: string
  name: string
  queueName: TournaQueueName
}

export abstract class BaseQueueProducer {
  constructor(protected readonly client: TournaQueueClient) {}

  protected async enqueue<TPayload>(
    definition: TournaJobDefinition<TPayload>,
    payload: TPayload,
    options: EnqueueOptions = {},
  ): Promise<QueuedJobReference> {
    const data = definition.schema.parse(payload)
    const job = await this.client.getQueue(definition.queueName).add(definition.name, data, {
      ...definition.defaultJobOptions,
      ...this.toJobOptions(options),
    })

    return {
      id: job.id,
      name: job.name,
      queueName: definition.queueName,
    }
  }

  private toJobOptions(options: EnqueueOptions): JobsOptions {
    return {
      jobId: options.jobId,
      delay: options.delay,
      priority: options.priority,
    }
  }
}
