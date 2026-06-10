import { schemaTask } from '@trigger.dev/sdk'
import { sendEmailPayloadSchema, sendEmailTask } from '@repo/tasks'
import { sendEmail } from '../src/handlers/notifications'

export const sendEmailTriggerTask = schemaTask({
  id: sendEmailTask.id,
  schema: sendEmailPayloadSchema,
  retry: sendEmailTask.retry,
  queue: sendEmailTask.queue,
  maxDuration: sendEmailTask.maxDuration,
  run: sendEmail,
})

