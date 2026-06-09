import { SEND_EMAIL_JOB_NAME } from './jobs'
import { parseTournaJobPayload } from './definitions'

describe('Tourna queue definitions', () => {
  it('validates registered job payloads', () => {
    const payload = parseTournaJobPayload(SEND_EMAIL_JOB_NAME, {
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
    const payload = parseTournaJobPayload(SEND_EMAIL_JOB_NAME, {
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
    const payload = parseTournaJobPayload(SEND_EMAIL_JOB_NAME, {
      to: 'player@example.com',
      content: {
        template: 'post-registration-notification',
        data: {
          displayName: 'Player',
          email: 'player@example.com',
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
    expect(() => parseTournaJobPayload('missing.job', {})).toThrow('Unknown Tourna job')
  })
})
