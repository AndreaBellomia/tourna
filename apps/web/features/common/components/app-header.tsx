import Link from 'next/link'
import { LayoutDashboard, Trophy, UserCircle, Users } from 'lucide-react'
import { type Locale, withLocale } from '../../../lib/i18n/config'
import type { Messages } from '../../../lib/i18n/web-i18n'

type NavKey = keyof Messages['common']['nav']

type AppHeaderProps = {
  locale: Locale
  messages: Messages['common']
  active: NavKey
}

const navItems: ReadonlyArray<{
  key: Exclude<NavKey, 'profile'>
  href: string
  icon: typeof Trophy
}> = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'teams', href: '/teams', icon: Trophy },
  { key: 'users', href: '/users', icon: Users },
]

export function AppHeader({ locale, messages, active }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 rounded-lg border border-border/80 bg-background/95 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Link className="flex min-w-0 items-center gap-3" href={withLocale(locale, '/dashboard')}>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Trophy aria-hidden="true" className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xl font-semibold leading-none">{messages.product}</p>
            <p className="mt-1 truncate text-sm text-muted-foreground">{messages.subtitle}</p>
          </div>
        </Link>

        <div className="flex items-center justify-between gap-2">
          <nav
            aria-label="Primary navigation"
            className="inline-flex rounded-md border border-border bg-muted/50 p-1"
          >
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.key === active

              return (
                <Link
                  key={item.key}
                  aria-current={isActive ? 'page' : undefined}
                  className={
                    isActive
                      ? 'inline-flex h-9 items-center justify-center gap-2 rounded-md bg-card px-3 text-sm font-medium text-foreground shadow-sm'
                      : 'inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-card/70 hover:text-foreground'
                  }
                  href={withLocale(locale, item.href)}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {messages.nav[item.key]}
                </Link>
              )
            })}
          </nav>

          <Link
            aria-current={active === 'profile' ? 'page' : undefined}
            aria-label={messages.nav.profile}
            className={
              active === 'profile'
                ? 'inline-flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm'
                : 'inline-flex size-10 items-center justify-center rounded-md border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground'
            }
            href={withLocale(locale, '/profile')}
          >
            <UserCircle aria-hidden="true" className="size-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}
