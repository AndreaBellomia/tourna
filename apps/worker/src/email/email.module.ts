import { Module } from '@nestjs/common'
import { createEmailEngine, EmailService, SmtpEmailProvider } from '@repo/email'
import { WorkerConfigModule } from '~/config/worker-config.module'
import { WorkerConfigService } from '~/config/worker-config.service'
import { WORKER_EMAIL_SERVICE } from './email.tokens'

@Module({
  imports: [WorkerConfigModule],
  providers: [
    {
      provide: WORKER_EMAIL_SERVICE,
      inject: [WorkerConfigService],
      useFactory: (config: WorkerConfigService) => {
        return new EmailService(createEmailEngine(), new SmtpEmailProvider(config.getSmtpConfig()))
      },
    },
  ],
  exports: [WORKER_EMAIL_SERVICE],
})
export class WorkerEmailModule {}
