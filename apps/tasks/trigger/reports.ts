import { schemaTask } from '@trigger.dev/sdk'
import { generateTournamentReportPayloadSchema, generateTournamentReportTask } from '@repo/tasks'
import { generateTournamentReport } from '../src/handlers/reports'

export const generateTournamentReportTriggerTask = schemaTask({
  id: generateTournamentReportTask.id,
  schema: generateTournamentReportPayloadSchema,
  retry: generateTournamentReportTask.retry,
  queue: generateTournamentReportTask.queue,
  maxDuration: generateTournamentReportTask.maxDuration,
  machine: generateTournamentReportTask.machine,
  run: async (payload) => {
    await Promise.resolve(generateTournamentReport(payload))
  },
})
