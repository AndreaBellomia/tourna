import type { EmailService } from '@repo/email'
import { NotificationsProcessor } from './notifications.processor'

describe('NotificationsProcessor', () => {
  it('passes the parsed payload to the email service', async () => {
    const email = {
      send: jest.fn().mockResolvedValue({
        provider: 'smtp',
        messageId: 'mailpit-1',
      }),
    } as unknown as EmailService

    const processor = new NotificationsProcessor(email)

    await processor.process({
      name: 'notifications.send-email.v1',
      id: 'job-1',
      data: {
        to: 'player@example.com',
        locale: 'it',
        metadata: { flow: 'welcome' },
        content: {
          template: 'welcome',
          data: {
            displayName: 'Andrea',
            dashboardUrl: 'https://tourna.test/dashboard',
          },
        },
      },
    } as never)

    expect(email.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'player@example.com',
        locale: 'it',
      }),
    )
  })
})
