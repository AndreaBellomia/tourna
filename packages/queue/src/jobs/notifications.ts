import { z } from 'zod'
import { TOURNA_QUEUE_NAMES } from '../queue-names'

export const SEND_EMAIL_JOB_NAME = 'notifications.send-email.v1'

export const sendEmailPayloadSchema = z
  .object({
    to: z.string().email(),
    subject: z.string().min(1).max(180),
    text: z.string().min(1).max(20_000).optional(),
    html: z.string().min(1).max(50_000).optional(),
    template: z.string().min(1).max(120).optional(),
    metadata: z.record(z.string(), z.string()).default({}),
  })
  .refine((payload) => payload.text || payload.html || payload.template, {
    message: 'Email jobs need text, html, or a template name',
  })

export type SendEmailPayload = z.infer<typeof sendEmailPayloadSchema>

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
