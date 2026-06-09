import { renderEmail } from './render-email'

describe('renderEmail', () => {
  it('renders english html and text by default for a registered template', async () => {
    const email = await renderEmail({
      template: 'welcome',
      data: {
        displayName: 'Andrea',
        dashboardUrl: 'https://tourna.test/dashboard',
      },
    })

    expect(email.subject).toBe('Welcome to Tourna, Andrea')
    expect(email.html).toContain('Welcome, Andrea')
    expect(email.text).toContain('https://tourna.test/dashboard')
  })

  it('renders italian html and text when locale is it', async () => {
    const email = await renderEmail(
      {
        template: 'welcome',
        data: {
          displayName: 'Andrea',
          dashboardUrl: 'https://tourna.test/dashboard',
        },
      },
      'it',
    )

    expect(email.subject).toBe('Benvenuto su Tourna, Andrea')
    expect(email.html).toContain('Benvenuto, Andrea')
    expect(email.text).toContain('Apri Tourna: https://tourna.test/dashboard')
  })

  it('renders localized report emails in english', async () => {
    const email = await renderEmail(
      {
        template: 'tournament-report-ready',
        data: {
          tournamentName: 'Spring Clash',
          format: 'pdf',
          reportUrl: 'https://tourna.test/reports/spring-clash',
        },
      },
      'en',
    )

    expect(email.subject).toBe('Spring Clash report is ready')
    expect(email.html).toContain('Tournament report ready')
    expect(email.text).toContain('Format: PDF')
    expect(email.text).toContain('Open report: https://tourna.test/reports/spring-clash')
  })

  it('renders post-registration notification emails in english', async () => {
    const email = await renderEmail(
      {
        template: 'post-registration-notification',
        data: {
          displayName: 'Andrea',
          email: 'andrea@example.com',
          verificationUrl: 'https://tourna.test/verify-email?token=token-1',
        },
      },
      'en',
    )

    expect(email.subject).toBe('Your Tourna registration is complete')
    expect(email.html).toContain('Registration completed')
    expect(email.text).toContain('Registered email: andrea@example.com')
  })
})
