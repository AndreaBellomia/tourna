import { Inject, Injectable, Logger } from '@nestjs/common'
import { EmailService } from '@repo/email'
import { SEND_EMAIL_JOB_NAME, sendEmailPayloadSchema, type SendEmailPayload } from '@repo/queue'
import type { Job } from 'bullmq'
import { WORKER_EMAIL_SERVICE } from '../email/email.tokens'

@Injectable()
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name)

  constructor(@Inject(WORKER_EMAIL_SERVICE) private readonly email: EmailService) {}

  async process(job: Job): Promise<void> {
    if (job.name !== SEND_EMAIL_JOB_NAME) {
      throw new Error(`Unsupported notifications job "${job.name}"`)
    }

    const payload = sendEmailPayloadSchema.parse(job.data)
    await this.sendEmail(payload, job.id)
  }

  private async sendEmail(payload: SendEmailPayload, jobId?: string): Promise<void> {
    const receipt = await this.email.send(payload)

    this.logger.log({
      message: 'Email job delivered',
      jobId,
      to: payload.to,
      template: payload.content.template,
      provider: receipt.provider,
      messageId: receipt.messageId,
    })
  }
}
