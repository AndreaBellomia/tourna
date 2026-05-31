import { SEND_EMAIL_JOB_NAME } from './jobs'
import { parseTournaJobPayload } from './definitions'

describe('Tourna queue definitions', () => {
  it('validates registered job payloads', () => {
    const payload = parseTournaJobPayload(SEND_EMAIL_JOB_NAME, {
      to: 'player@example.com',
      subject: 'Welcome',
      text: 'Hello from Tourna',
    })

    expect(payload).toMatchObject({
      to: 'player@example.com',
      subject: 'Welcome',
      text: 'Hello from Tourna',
    })
  })

  it('rejects unknown job names', () => {
    expect(() => parseTournaJobPayload('missing.job', {})).toThrow('Unknown Tourna job')
  })
})
