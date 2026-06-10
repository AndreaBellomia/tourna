import { createEmailEngine, EmailService, SmtpEmailProvider } from '@repo/email'
import type { SendEmailPayload } from '@repo/tasks'
import { getTaskEnv } from '../config/env'

export async function sendEmail(payload: SendEmailPayload): Promise<void> {
  const env = getTaskEnv()
  const email = new EmailService(
    createEmailEngine(),
    new SmtpEmailProvider({
      host: env.EMAIL_SMTP_HOST,
      port: env.EMAIL_SMTP_PORT,
      secure: env.EMAIL_SMTP_SECURE,
      user: env.EMAIL_SMTP_USER,
      password: env.EMAIL_SMTP_PASSWORD,
      defaultFrom: env.EMAIL_DEFAULT_FROM,
      defaultReplyTo: env.EMAIL_DEFAULT_REPLY_TO,
    }),
  )

  await email.send(payload)
}

