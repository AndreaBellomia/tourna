import { generateTournamentReportTask, type GenerateTournamentReportPayload } from '../tasks'
import {
  BaseTaskProducer,
  type TriggeredTaskRunReference,
  type TriggerTaskOptions,
} from './base.producer'

export class ReportsTaskProducer extends BaseTaskProducer {
  generateTournamentReport(
    payload: GenerateTournamentReportPayload,
    options: TriggerTaskOptions = {},
  ): Promise<TriggeredTaskRunReference> {
    return this.trigger(generateTournamentReportTask, payload, options)
  }
}
