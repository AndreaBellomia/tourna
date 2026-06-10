import { SEND_EMAIL_TASK_ID } from './tasks'
import { parseTournaTaskPayload } from './definitions'

describe('Tourna task definitions', () => {
  it('validates registered job payloads', () => {
    const payload = parseTournaTaskPayload(SEND_EMAIL_TASK_ID, {
      to: 'player@example.com',
      content: {
        template: 'welcome',
        data: {
          displayName: 'Player',
          dashboardUrl: 'https://tourna.test/dashboard',
        },
      },
    })

    expect(payload).toMatchObject({
      to: 'player@example.com',
      content: {
        template: 'welcome',
      },
    })
  })

  it('applies the default email locale when it is omitted', () => {
    const payload = parseTournaTaskPayload(SEND_EMAIL_TASK_ID, {
      to: 'player@example.com',
      content: {
        template: 'welcome',
        data: {
          displayName: 'Player',
          dashboardUrl: 'https://tourna.test/dashboard',
        },
      },
    })

    expect(payload.locale).toBe('en')
  })

  it('validates post-registration email payloads', () => {
    const payload = parseTournaTaskPayload(SEND_EMAIL_TASK_ID, {
      to: 'player@example.com',
      content: {
        template: 'post-registration-notification',
        data: {
          displayName: 'Player',
          email: 'player@example.com',
          verificationUrl: 'https://tourna.test/verify-email?token=token-1',
        },
      },
    })

    expect(payload).toMatchObject({
      content: {
        template: 'post-registration-notification',
      },
    })
  })

  it('rejects unknown job names', () => {
    expect(() => parseTournaTaskPayload('missing.task', {})).toThrow('Unknown Tourna task')
  })
})
