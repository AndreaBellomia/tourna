import { Module } from '@nestjs/common'
import { WorkerConfigModule } from '../config/worker-config.module'
import {
  MaintenanceProcessor,
  NotificationsProcessor,
  RatingsProcessor,
  ReportsProcessor,
} from '../processors'
import { WorkerManagerService } from './worker-manager.service'

@Module({
  imports: [WorkerConfigModule],
  providers: [
    WorkerManagerService,
    NotificationsProcessor,
    ReportsProcessor,
    RatingsProcessor,
    MaintenanceProcessor,
  ],
})
export class WorkerModule {}
