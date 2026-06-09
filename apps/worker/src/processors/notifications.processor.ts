import { Inject, Injectable, Logger } from '@nestjs/common'
import { EmailService } from '@repo/email'
import { SEND_EMAIL_JOB_NAME, sendEmailPayloadSchema, type SendEmailPayload } from '@repo/queue'
import { WORKER_EMAIL_SERVICE } from '~/email/email.tokens'
import { BaseWorkerProcessor, type WorkerProcessDefinition } from './processor.definition'
import { Job } from 'bullmq'

@Injectable()
export class NotificationsProcessor extends BaseWorkerProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name)

  constructor(@Inject(WORKER_EMAIL_SERVICE) private readonly email: EmailService) {
    super()
  }

  protected getProcessDefinitions(): Array<WorkerProcessDefinition> {
    return [
      {
        jobName: SEND_EMAIL_JOB_NAME,
        run: async (job) => {
          const payload = sendEmailPayloadSchema.parse(job.data)
          await this.sendEmail(payload, job.id)
        },
      },
    ]
  }

  protected getUnsupportedJobErrorMessage(job: Job): string {
    return `Unsupported notification job "${job.name}"`
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
