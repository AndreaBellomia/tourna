import { Button } from 'react-email'
import type { ReactNode } from 'react'
import { emailTheme } from '../theme/tokens'

export interface EmailButtonProps {
  href: string
  children: ReactNode
}

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: emailTheme.colors.accent,
        borderRadius: emailTheme.radii.button,
        color: emailTheme.colors.accentText,
        display: 'inline-block',
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '20px',
        padding: '12px 18px',
        textDecoration: 'none',
      }}
    >
      {children}
    </Button>
  )
}
