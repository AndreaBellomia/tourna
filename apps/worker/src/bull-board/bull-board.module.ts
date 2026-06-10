import { Module } from '@nestjs/common'
import { WorkerConfigModule } from '~/config/worker-config.module'
import { BullBoardService } from './bull-board.service'

@Module({
  imports: [WorkerConfigModule],
  providers: [BullBoardService],
})
export class BullBoardModule {}
