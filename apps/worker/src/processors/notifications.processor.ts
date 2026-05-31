import { Injectable, Logger } from '@nestjs/common'
import { SEND_EMAIL_JOB_NAME, sendEmailPayloadSchema, type SendEmailPayload } from '@repo/queue'
import type { Job } from 'bullmq'

@Injectable()
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name)

  process(job: Job): void {
    if (job.name !== SEND_EMAIL_JOB_NAME) {
      throw new Error(`Unsupported notifications job "${job.name}"`)
    }

    const payload = sendEmailPayloadSchema.parse(job.data)
    this.sendEmail(payload, job.id)
  }

  private sendEmail(payload: SendEmailPayload, jobId?: string): void {
    this.logger.log({
      message: 'Email job accepted by worker',
      jobId,
      to: payload.to,
      subject: payload.subject,
      template: payload.template,
    })
  }
}
