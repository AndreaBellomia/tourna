import { Module } from '@nestjs/common'
import { AppConfigModule } from '../config/config.module'
import { QueueProducerService } from './queue-producer.service'

@Module({
  imports: [AppConfigModule],
  providers: [QueueProducerService],
  exports: [QueueProducerService],
})
export class QueueModule {}
