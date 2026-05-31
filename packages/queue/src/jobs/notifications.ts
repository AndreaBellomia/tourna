import { sendEmailCommandSchema, type SendEmailCommand } from '@repo/email/contracts'
import { TOURNA_QUEUE_NAMES } from '../queue-names'

export const SEND_EMAIL_JOB_NAME = 'notifications.send-email.v1'

export const sendEmailPayloadSchema = sendEmailCommandSchema

export type SendEmailPayload = SendEmailCommand

export const sendEmailJob = {
  queueName: TOURNA_QUEUE_NAMES.notifications,
  name: SEND_EMAIL_JOB_NAME,
  schema: sendEmailPayloadSchema,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 30_000,
    },
    removeOnComplete: {
      age: 60 * 60 * 24,
      count: 1_000,
    },
    removeOnFail: {
      age: 60 * 60 * 24 * 14,
      count: 5_000,
    },
  },
} as const
