import { sendEmail } from './notifications'

jest.mock('@repo/email', () => {
  const send = jest.fn()

  return {
    __send: send,
    createEmailEngine: jest.fn(() => ({})),
    SmtpEmailProvider: jest.fn().mockImplementation((config: unknown) => ({ config })),
    EmailService: jest.fn().mockImplementation(() => ({ send })),
  }
})

const emailModule: { __send: jest.Mock; EmailService: jest.Mock } = jest.requireMock('@repo/email')

describe('sendEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    emailModule.__send.mockResolvedValue({
      provider: 'smtp',
      messageId: 'mailpit-1',
    })
  })

  it('passes the parsed payload to the email service', async () => {
    await sendEmail({
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
    })

    expect(emailModule.__send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'player@example.com',
        locale: 'it',
      }),
    )
  })
})
