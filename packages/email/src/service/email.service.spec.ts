import { createEmailEngine } from '../core/email.engine'
import type { EmailProvider } from '../providers/email.provider'
import { EmailService } from './email.service'

describe('EmailService', () => {
  it('renders localized content and forwards it to the provider', async () => {
    const provider = {
      send: jest.fn().mockResolvedValue({
        provider: 'test',
        messageId: 'msg-1',
      }),
    } satisfies EmailProvider

    const service = new EmailService(createEmailEngine(), provider)

    const receipt = await service.send({
      to: 'player@example.com',
      locale: 'en',
      metadata: { flow: 'welcome' },
      content: {
        template: 'welcome',
        data: {
          displayName: 'Andrea',
          dashboardUrl: 'https://tourna.test/dashboard',
        },
      },
    })

    expect(receipt).toEqual({ provider: 'test', messageId: 'msg-1' })
    expect(provider.send).toHaveBeenCalledWith(
      expect.objectContaining({
        envelope: expect.objectContaining({
          to: 'player@example.com',
          metadata: { flow: 'welcome' },
        }),
        email: expect.objectContaining({
          subject: 'Welcome to Tourna, Andrea',
          text: expect.stringContaining('Open Tourna: https://tourna.test/dashboard'),
        }),
      }),
    )
  })

  it('uses the default locale when the command does not provide one', async () => {
    const provider = {
      send: jest.fn().mockResolvedValue({
        provider: 'test',
        messageId: 'msg-2',
      }),
    } satisfies EmailProvider

    const service = new EmailService(createEmailEngine(), provider)

    await service.send({
      to: 'player@example.com',
      metadata: { flow: 'welcome' },
      content: {
        template: 'welcome',
        data: {
          displayName: 'Andrea',
          dashboardUrl: 'https://tourna.test/dashboard',
        },
      },
    })

    expect(provider.send).toHaveBeenCalledWith(
      expect.objectContaining({
        email: expect.objectContaining({
          subject: 'Welcome to Tourna, Andrea',
          text: expect.stringContaining('Open Tourna: https://tourna.test/dashboard'),
        }),
      }),
    )
  })
})
