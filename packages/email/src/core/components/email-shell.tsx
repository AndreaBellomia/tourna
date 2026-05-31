import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'react-email'
import type { ReactNode } from 'react'
import { emailTheme } from '../theme/tokens'

export interface EmailShellProps {
  preview: string
  title: string
  footer: string
  children: ReactNode
}

export function EmailShell({ preview, title, footer, children }: EmailShellProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: emailTheme.colors.background,
          color: emailTheme.colors.text,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          margin: 0,
          padding: '32px 12px',
        }}
      >
        <Container
          style={{
            backgroundColor: emailTheme.colors.surface,
            border: `1px solid ${emailTheme.colors.border}`,
            borderRadius: emailTheme.radii.surface,
            margin: '0 auto',
            maxWidth: '560px',
            padding: emailTheme.spacing.container,
          }}
        >
          <Text
            style={{
              color: emailTheme.colors.accent,
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: 0,
              margin: '0 0 18px',
              textTransform: 'uppercase',
            }}
          >
            {emailTheme.brandName}
          </Text>
          <Heading
            as="h1"
            style={{
              color: emailTheme.colors.text,
              fontSize: '28px',
              letterSpacing: 0,
              lineHeight: '34px',
              margin: '0 0 18px',
            }}
          >
            {title}
          </Heading>
          <Section>{children}</Section>
          <Text
            style={{
              borderTop: `1px solid ${emailTheme.colors.border}`,
              color: emailTheme.colors.muted,
              fontSize: '12px',
              lineHeight: '18px',
              margin: '32px 0 0',
              paddingTop: '18px',
            }}
          >
            {footer}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
