'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { LayoutDashboard, LogOut, Plus, Settings, Trophy, UserCircle, Users } from 'lucide-react'
import { Badge } from '@repo/ui/badge'
import { Button, buttonVariants } from '@repo/ui/button'
import { Separator } from '@repo/ui/separator'
import { cn } from '@repo/ui/utils'
import { logout } from '~/features/common/actions/logout'
import { withLocale } from '~/lib/i18n/config'
import { useI18n, useTranslations } from '~/lib/i18n/client'

type AppShellActive = 'dashboard' | 'teams' | 'users' | 'profile'

type AppShellProps = {
  active: AppShellActive
  children: ReactNode
}

const navItems = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'teams', href: '/teams', icon: Trophy },
  { key: 'users', href: '/users', icon: Users },
] as const

export function AppShell({ active, children }: AppShellProps) {
  const { locale } = useI18n()
  const t = useTranslations('common')

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col lg:flex-row">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-card/70 px-4 py-5 lg:flex lg:flex-col">
          <ShellBrand />

          <div className="mt-6 space-y-6">
            <ShellSection title={t('shell.menu')}>
              <ShellNav active={active} />
            </ShellSection>

            <ShellSection title={t('shell.quickActions')}>
              <Link
                className={buttonVariants({ className: 'w-full justify-start' })}
                href={withLocale(locale, '/teams/new')}
              >
                <Plus aria-hidden="true" className="size-4" />
                {t('shell.createTeam')}
              </Link>
              <div className="flex h-10 items-center justify-between rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground">
                <span>{t('nav.tournaments')}</span>
                <Badge variant="outline">{t('shell.tournamentsSoon')}</Badge>
              </div>
            </ShellSection>
          </div>

          <div className="mt-auto space-y-4">
            <Separator />
            <ShellSection title={t('shell.account')}>
              <Link
                className={shellNavClass(active === 'profile')}
                href={withLocale(locale, '/profile')}
              >
                <UserCircle aria-hidden="true" className="size-4" />
                {t('nav.profile')}
              </Link>
              <Link className={shellNavClass(false)} href={withLocale(locale, '/profile')}>
                <Settings aria-hidden="true" className="size-4" />
                {t('nav.settings')}
              </Link>
              <form action={logout.bind(null, locale)}>
                <Button className="w-full justify-start" type="submit" variant="ghost">
                  <LogOut aria-hidden="true" className="size-4" />
                  {t('shell.signOut')}
                </Button>
              </form>
            </ShellSection>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-border bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <ShellBrand compact />
              <Link
                className={buttonVariants({ size: 'icon-sm', variant: 'outline' })}
                href={withLocale(locale, '/profile')}
                aria-label={t('nav.profile')}
              >
                <UserCircle aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <nav className="mt-3 flex gap-2 overflow-x-auto" aria-label="Primary navigation">
              <ShellNav active={active} compact />
            </nav>
          </header>

          <div className="flex-1 px-5 py-6 md:px-8">{children}</div>
        </div>
      </div>
    </main>
  )
}

function ShellBrand({ compact }: { compact?: boolean }) {
  const { locale } = useI18n()
  const t = useTranslations('common')

  return (
    <Link className="flex min-w-0 items-center gap-3" href={withLocale(locale, '/dashboard')}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary text-primary-foreground">
        <Trophy aria-hidden="true" className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-lg font-semibold leading-none">{t('product')}</p>
          {!compact ? <Badge variant="accent">Ops</Badge> : null}
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">{t('subtitle')}</p>
      </div>
    </Link>
  )
}

function ShellSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="space-y-2">
      <p className="px-2 text-xs font-medium uppercase text-muted-foreground">{title}</p>
      <div className="space-y-1">{children}</div>
    </section>
  )
}

function ShellNav({
  active,
  compact,
}: {
  active: AppShellActive
  compact?: boolean
}) {
  const { locale } = useI18n()
  const t = useTranslations('common')

  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = active === item.key

        return (
          <Link
            key={item.key}
            aria-current={isActive ? 'page' : undefined}
            className={shellNavClass(isActive, compact)}
            href={withLocale(locale, item.href)}
          >
            <Icon aria-hidden="true" className="size-4" />
            {t(`nav.${item.key}`)}
          </Link>
        )
      })}
    </>
  )
}

function shellNavClass(active: boolean, compact?: boolean) {
  return cn(
    'flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors',
    compact ? 'shrink-0' : 'w-full',
    active
      ? 'border border-primary/30 bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  )
}
