import { createEmailEngine } from '../core/email.engine'
import type { EmailProvider } from '../providers/email.provider'
import { EmailService } from './email.service'

describe('EmailService', () => {
  it('renders localized content and forwards it to the provider', async () => {
    const send = jest
      .fn<ReturnType<EmailProvider['send']>, Parameters<EmailProvider['send']>>()
      .mockResolvedValue({
        provider: 'test',
        messageId: 'msg-1',
      })
    const provider = {
      send,
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
    const [input] = send.mock.calls[0]!
    expect(input.envelope.to).toBe('player@example.com')
    expect(input.envelope.metadata).toEqual({ flow: 'welcome' })
    expect(input.email.subject).toBe('Welcome to Tourna, Andrea')
    expect(input.email.text).toContain('Open Tourna: https://tourna.test/dashboard')
  })

  it('uses the default locale when the command does not provide one', async () => {
    const send = jest
      .fn<ReturnType<EmailProvider['send']>, Parameters<EmailProvider['send']>>()
      .mockResolvedValue({
        provider: 'test',
        messageId: 'msg-2',
      })
    const provider = {
      send,
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

    const [input] = send.mock.calls[0]!
    expect(input.email.subject).toBe('Welcome to Tourna, Andrea')
    expect(input.email.text).toContain('Open Tourna: https://tourna.test/dashboard')
  })
})
