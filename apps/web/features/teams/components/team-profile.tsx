'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Eye, MailPlus, Pencil, Settings, ShieldCheck, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar'
import { Badge } from '@repo/ui/badge'
import { Button, buttonVariants } from '@repo/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card'
import { Separator } from '@repo/ui/separator'
import { cn } from '@repo/ui/utils'
import type { TeamDetailResponse } from '@repo/contracts'
import { SettingsSection } from '~/features/common/components/settings-section'
import { type Locale, withLocale } from '~/lib/i18n/config'
import type { Messages } from '~/lib/i18n/web-i18n'
import { fetchTeam } from '~/features/teams/services/team-client'
import { MarkdownContent } from './markdown-content'
import { TeamInvitationPanel } from './team-invitation-panel'

type TeamProfileProps = {
  locale: Locale
  messages: Messages['teams']
  initialTeam: TeamDetailResponse
}

type TeamSection = 'overview' | 'members' | 'invitations' | 'settings'

export function TeamProfile({ locale, messages, initialTeam }: TeamProfileProps) {
  const [team, setTeam] = useState(initialTeam)
  const [activeSection, setActiveSection] = useState<TeamSection>('overview')

  useEffect(() => {
    let active = true

    void fetchTeam(initialTeam.slug)
      .then((freshTeam) => {
        if (active) setTeam(freshTeam)
      })
      .catch(() => {
        // Keep the public server-rendered cover if the viewer context cannot be refreshed.
      })

    return () => {
      active = false
    }
  }, [initialTeam.slug])

  const viewerMembership = team.viewerMembership
  const canManage = Boolean(viewerMembership?.canManage)
  const initials = getInitials(team.name, 'TM')
  const sections: Array<{ icon: typeof Eye; key: TeamSection; label: string }> = [
    { key: 'overview', label: messages.detail.overview, icon: Eye },
    { key: 'members', label: messages.detail.membersTitle, icon: Users },
    ...(canManage
      ? [
          { key: 'invitations' as const, label: messages.invites.title, icon: MailPlus },
          { key: 'settings' as const, label: messages.detail.settings, icon: Settings },
        ]
      : []),
  ]

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className={buttonVariants({ variant: 'outline' })}
          href={withLocale(locale, '/teams')}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {messages.detail.back}
        </Link>

        {canManage ? (
          <Link className={buttonVariants()} href={withLocale(locale, `/teams/${team.slug}/edit`)}>
            <Pencil aria-hidden="true" className="size-4" />
            {messages.detail.editTitle}
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
              {viewerMembership ? (
                <>
                  <span className="text-muted-foreground">{messages.detail.role}</span>
                  <span className="text-right font-medium text-foreground">
                    {viewerMembership.role}
                  </span>
                </>
              ) : null}
              <span className="text-muted-foreground">{messages.detail.status}</span>
              <span className="text-right font-medium text-foreground">{team.status}</span>
              <span className="text-muted-foreground">{messages.detail.visibility}</span>
              <span className="text-right font-medium text-foreground">
                {messages.visibility[team.visibility]}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.key

              return (
                <button
                  key={section.key}
                  className={cn(
                    'flex h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {section.label}
                </button>
              )
            })}
          </aside>

          <div className="min-w-0">
            {activeSection === 'overview' ? (
              <OverviewSection messages={messages} team={team} />
            ) : null}
            {activeSection === 'members' ? (
              <MembersSection
                canManage={canManage}
                locale={locale}
                messages={messages}
                team={team}
                onInvite={() => setActiveSection('invitations')}
              />
            ) : null}
            {activeSection === 'invitations' && canManage ? (
              <InvitationsSection locale={locale} messages={messages} team={team} />
            ) : null}
            {activeSection === 'settings' && canManage ? (
              <SettingsTab locale={locale} messages={messages} team={team} />
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}

function OverviewSection({
  messages,
  team,
}: {
  messages: Messages['teams']
  team: TeamDetailResponse
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="min-w-0 space-y-4">
        <div className="flex items-center gap-2">
          <Eye aria-hidden="true" className="size-4 text-accent" />
          <h2 className="text-xl font-semibold">{messages.detail.overview}</h2>
        </div>
        <MarkdownContent value={team.description} emptyLabel={messages.detail.emptyDescription} />
      </section>

      <Card variant="muted">
        <CardHeader>
          <CardTitle className="text-base">{messages.detail.membershipTitle}</CardTitle>
          <CardDescription>
            {team.viewerMembership
              ? messages.detail.membershipDescription
              : messages.detail.publicDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Badge variant={team.visibility === 'public' ? 'success' : 'outline'}>
            {messages.visibility[team.visibility]}
          </Badge>
          <Badge variant="outline">
            {team.viewerMembership?.role ?? messages.detail.publicViewer}
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}

function MembersSection({
  canManage,
  locale,
  messages,
  onInvite,
  team,
}: {
  canManage: boolean
  locale: Locale
  messages: Messages['teams']
  onInvite: () => void
  team: TeamDetailResponse
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Users aria-hidden="true" className="size-4" />
            {messages.detail.membersTitle}
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {messages.detail.membersDescription}
          </p>
        </div>
        {canManage ? (
          <Button type="button" variant="outline" onClick={onInvite}>
            <MailPlus aria-hidden="true" className="size-4" />
            {messages.detail.inviteButton}
          </Button>
        ) : null}
      </div>
      <Separator />

      <div className="space-y-2">
        {team.members.length > 0 ? (
          team.members.map((member) => (
            <Link
              key={member.user.id}
              className="flex items-center gap-3 rounded-md border border-border bg-muted/40 p-3 transition-colors hover:bg-muted"
              href={withLocale(locale, `/users/${member.user.nickname}`)}
            >
              <Avatar>
                {member.user.avatarUrl ? (
                  <AvatarImage src={member.user.avatarUrl} />
                ) : (
                  <AvatarFallback>{getInitials(member.user.display_name, 'U')}</AvatarFallback>
                )}
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{member.user.display_name}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  @{member.user.nickname}
                </p>
              </div>
              <Badge variant="outline">{member.role}</Badge>
            </Link>
          ))
        ) : (
          <Card className="border-dashed p-5 text-sm text-muted-foreground" variant="muted">
            {messages.detail.emptyMembers}
          </Card>
        )}
      </div>
    </section>
  )
}

function InvitationsSection({
  locale,
  messages,
  team,
}: {
  locale: Locale
  messages: Messages['teams']
  team: TeamDetailResponse
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <MailPlus aria-hidden="true" className="size-4" />
            {messages.invites.title}
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {messages.invites.description}
          </p>
        </div>
        <TeamInvitationPanel locale={locale} messages={messages.invites} team={team} />
      </div>

      <Card variant="muted">
        <CardHeader>
          <CardTitle className="text-base">{messages.invites.statusTitle}</CardTitle>
          <CardDescription>{messages.invites.statusDescription}</CardDescription>
        </CardHeader>
      </Card>
    </section>
  )
}

function SettingsTab({
  locale,
  messages,
  team,
}: {
  locale: Locale
  messages: Messages['teams']
  team: TeamDetailResponse
}) {
  return (
    <div className="space-y-4">
      <SettingsSection
        title={messages.detail.editTitle}
        description={messages.detail.editDescription}
        actions={
          <Link
            className={buttonVariants({ variant: 'outline' })}
            href={withLocale(locale, `/teams/${team.slug}/edit`)}
          >
            <Pencil aria-hidden="true" className="size-4" />
            {messages.detail.editTitle}
          </Link>
        }
      >
        <p className="text-sm leading-6 text-muted-foreground">
          {messages.settings.profileDescription}
        </p>
      </SettingsSection>

      <SettingsSection
        title={messages.detail.permissionsTitle}
        description={messages.detail.permissionsDescription}
      >
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="size-4 text-accent" />
          {messages.detail.disabledAction}
        </div>
      </SettingsSection>
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
