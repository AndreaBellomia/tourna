import { sendEmailCommandSchema, type SendEmailCommand } from '@repo/email/contracts'
import { TOURNA_TASK_QUEUES } from '../task-queues'

export const SEND_EMAIL_TASK_ID = 'notifications.send-email.v1'

export const sendEmailPayloadSchema = sendEmailCommandSchema

export type SendEmailPayload = SendEmailCommand

export const sendEmailTask = {
  id: SEND_EMAIL_TASK_ID,
  queue: {
    name: TOURNA_TASK_QUEUES.notifications,
    concurrencyLimit: 5,
  },
  schema: sendEmailPayloadSchema,
  retry: {
    maxAttempts: 5,
    minTimeoutInMs: 30_000,
    factor: 2,
    randomize: true,
  },
  maxDuration: 60,
} as const
