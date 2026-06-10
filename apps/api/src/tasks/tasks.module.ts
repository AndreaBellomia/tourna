import { Module } from '@nestjs/common'
import { TaskProducerService } from './task-producer.service'

@Module({
  providers: [TaskProducerService],
  exports: [TaskProducerService],
})
export class TasksModule {}
