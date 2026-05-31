import { Injectable, Logger } from '@nestjs/common'
import { MAINTENANCE_HEARTBEAT_JOB_NAME, maintenanceHeartbeatPayloadSchema } from '@repo/queue'
import type { Job } from 'bullmq'

@Injectable()
export class MaintenanceProcessor {
  private readonly logger = new Logger(MaintenanceProcessor.name)

  process(job: Job): void {
    if (job.name !== MAINTENANCE_HEARTBEAT_JOB_NAME) {
      throw new Error(`Unsupported maintenance job "${job.name}"`)
    }

    const payload = maintenanceHeartbeatPayloadSchema.parse(job.data)

    this.logger.log({
      message: 'Maintenance heartbeat processed',
      jobId: job.id,
      scheduledAt: payload.scheduledAt,
    })
  }
}
