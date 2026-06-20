'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Eye, MailPlus, Pencil, Settings, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar'
import { buttonVariants } from '@repo/ui/button'

import { useTeam } from '../hooks/team-provider'
import { withLocale } from '~/lib/i18n/config'
import { useI18n, useTranslations } from '~/lib/i18n/client'
import { cn } from '@repo/ui/utils'

type TeamSection = 'overview' | 'members' | 'invitations' | 'settings'

type TeamSidebarProps = {
  children: React.ReactNode
}

type SidebarSection = {
  icon: typeof Eye
  key: TeamSection
  label: string
  href: string
  exact?: boolean
}

export function TeamSidebar({ children }: Readonly<TeamSidebarProps>) {
  const { locale } = useI18n()
  const t = useTranslations('teams')
  const pathname = usePathname()
  const { team, canManage } = useTeam()
  const initials = getInitials(team.name, 'TM')
  const teamHref = withLocale(locale, `/teams/${team.slug}`)

  const sections: SidebarSection[] = [
    {
      key: 'overview',
      label: t('detail.overview'),
      icon: Eye,
      href: teamHref,
      exact: true,
    },
    {
      key: 'members',
      label: t('detail.membersTitle'),
      icon: Users,
      href: `${teamHref}/members`,
    },
    ...(canManage
      ? [
          {
            key: 'invitations' as const,
            label: t('invites.title'),
            icon: MailPlus,
            href: `${teamHref}/invitations`,
          },
          {
            key: 'settings' as const,
            label: t('detail.settings'),
            icon: Settings,
            href: `${teamHref}/settings`,
          },
        ]
      : []),
  ]

  function isSectionActive(section: SidebarSection) {
    if (section.exact) {
      return pathname === section.href
    }

    return pathname === section.href || pathname.startsWith(`${section.href}/`)
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className={buttonVariants({ variant: 'outline' })}
          href={withLocale(locale, '/teams')}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t('detail.back')}
        </Link>

        {canManage ? (
          <Link className={buttonVariants()} href={withLocale(locale, `/teams/${team.slug}/edit`)}>
            <Pencil aria-hidden="true" className="size-4" />
            {t('detail.editTitle')}
          </Link>
        ) : null}
      </div>

      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border bg-muted/50 px-5 py-8 md:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-20 border-primary/25 bg-primary/15 text-xl">
                {team.logoUrl ? (
                  <AvatarImage src={team.logoUrl} />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="min-w-0">
                <h1 className="truncate text-4xl font-semibold tracking-normal md:text-5xl">
                  {team.name}
                </h1>
                <p className="mt-2 truncate font-mono text-sm text-muted-foreground">
                  @{team.slug} [{team.tag}]
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 rounded-lg border border-border bg-card/70 px-3 py-2 text-xs">
              {team.viewerMembership ? (
                <>
                  <span className="text-muted-foreground">{t('detail.role')}</span>
                  <span className="text-right font-medium text-foreground">
                    {team.viewerMembership.role}
                  </span>
                </>
              ) : null}
              <span className="text-muted-foreground">{t('detail.status')}</span>
              <span className="text-right font-medium text-foreground">{team.status}</span>
              <span className="text-muted-foreground">{t('detail.visibility')}</span>
              <span className="text-right font-medium text-foreground">
                {t(`visibility.${team.visibility}`)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = isSectionActive(section)

              return (
                <Link
                  key={section.key}
                  href={section.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {section.label}
                </Link>
              )
            })}
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </section>
    </div>
  )
}

function getInitials(value: string, fallback: string) {
  const initials = value
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return initials || fallback
}
