'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Eye, Pencil, Users } from 'lucide-react'
import { Badge } from '@repo/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@repo/ui/card'
import type { TeamDetailResponse } from '@repo/contracts'
import { type Locale, withLocale } from '~/lib/i18n/config'
import type { Messages } from '~/lib/i18n/web-i18n'
import { fetchTeam } from '~/features/teams/services/team-client'
import { MarkdownContent } from './markdown-content'
import { cn } from '@repo/ui/utils'

type TeamProfileProps = {
  locale: Locale
  messages: Messages['teams']
  initialTeam: TeamDetailResponse
}

export function TeamProfile({ locale, messages, initialTeam }: TeamProfileProps) {
  const [team, setTeam] = useState(initialTeam)

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
  const initials = team.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
          href={withLocale(locale, '/teams')}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {messages.detail.back}
        </Link>

        {canManage ? (
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            href={withLocale(locale, `/teams/${team.slug}/edit`)}
          >
            <Pencil aria-hidden="true" className="size-4" />
            {messages.detail.editTitle}
          </Link>
        ) : null}
      </div>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-primary px-5 py-10 text-primary-foreground md:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-20 shrink-0 items-center justify-center rounded-md border border-primary-foreground/20 bg-primary-foreground text-xl font-semibold text-primary">
                {team.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" className="size-full rounded-md object-cover" src={team.logoUrl} />
                ) : (
                  initials || 'TM'
                )}
              </div>
              <div className="flex flex-col justify-between">
                <h1 className="text-4xl font-semibold tracking-normal md:text-5xl">{team.name}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-secondary text-sm">
                    @{team.slug} [{team.tag}]
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-[auto_1fr] border border-md border-primary-foreground/15 items-center gap-x-3 gap-y-1.5 rounded-lg px-3 py-2 text-xs">
                {viewerMembership ? (
                  <>
                    <span className="text-primary-foreground/60">{messages.detail.role}</span>
                    <span className="text-right font-medium text-primary-foreground">
                      {viewerMembership.role}
                    </span>
                  </>
                ) : null}

                <span className="text-primary-foreground/60">{messages.detail.status}</span>
                <span className="text-right font-medium text-primary-foreground">
                  {team.status}
                </span>

                <span className="text-primary-foreground/60">{messages.detail.visibility}</span>
                <span className="text-right font-medium text-primary-foreground">
                  {messages.visibility[team.visibility]}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 md:p-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-4">
            <div className="flex items-center gap-2">
              <Eye aria-hidden="true" className="size-4 text-accent" />
              <h2 className="text-xl font-semibold">{messages.detail.overview}</h2>
            </div>
            <MarkdownContent
              value={team.description}
              emptyLabel={messages.detail.emptyDescription}
            />
          </div>

          <aside className="space-y-4">
            <div className="flex items-center gap-2 text-lg">
              <Users aria-hidden="true" className="size-4" />
              {messages.detail.membersTitle}
            </div>
            <p className={cn('text-sm leading-6 text-muted-foreground')}>
              {messages.detail.membersDescription}
            </p>
            <div className="space-y-2">
              {team.members.length > 0 ? (
                team.members.map((member) => (
                  <Link
                    key={member.user.id}
                    className="flex items-center gap-3 rounded-md border border-border bg-muted/40 p-3 transition-colors hover:bg-muted"
                    href={withLocale(locale, `/users/${member.user.nickname}`)}
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background text-sm font-semibold">
                      {member.user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt=""
                          className="size-full object-cover"
                          src={member.user.avatarUrl}
                        />
                      ) : (
                        member.user.display_name.slice(0, 2).toUpperCase()
                      )}
                    </div>
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
                <p className="text-sm text-muted-foreground">{messages.detail.emptyMembers}</p>
              )}
            </div>

            {canManage ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{messages.detail.permissionsTitle}</CardTitle>
                    <CardDescription>{messages.detail.permissionsDescription}</CardDescription>
                  </CardHeader>
                </Card>
              </>
            ) : null}
          </aside>
        </div>
      </section>
    </div>
  )
}
