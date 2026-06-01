'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Eye, Pencil, ShieldCheck, Users } from 'lucide-react'
import { Badge } from '@repo/ui/badge'
import { Button } from '@repo/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card'
import type { TeamDetailResponse } from '@repo/contracts'
import { type Locale, withLocale } from '../../../lib/i18n/config'
import type { Messages } from '../../../lib/i18n/web-i18n'
import { fetchTeam } from '../services/team-client'
import { MarkdownContent } from './markdown-content'

type TeamProfileProps = {
  locale: Locale
  messages: Messages['teams']
  initialTeam: TeamDetailResponse
}

export function TeamProfile({ locale, messages, initialTeam }: TeamProfileProps) {
  const [team, setTeam] = useState(initialTeam)

  useEffect(() => {
    let active = true

    void fetchTeam(initialTeam.id)
      .then((freshTeam) => {
        if (active) setTeam(freshTeam)
      })
      .catch(() => {
        // Keep the public server-rendered cover if the viewer context cannot be refreshed.
      })

    return () => {
      active = false
    }
  }, [initialTeam.id])

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
            href={withLocale(locale, `/teams/${team.id}/edit`)}
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
                {initials || 'TM'}
              </div>
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">@{team.slug}</Badge>
                  <Badge variant={team.visibility === 'public' ? 'success' : 'outline'}>
                    {messages.visibility[team.visibility]}
                  </Badge>
                  {viewerMembership ? (
                    <Badge variant={canManage ? 'success' : 'secondary'}>
                      {viewerMembership.role}
                    </Badge>
                  ) : null}
                </div>
                <h1 className="text-4xl font-semibold tracking-normal md:text-5xl">{team.name}</h1>
              </div>
            </div>
            <p className="rounded-md border border-primary-foreground/15 px-3 py-2 font-mono text-xs text-primary-foreground/75">
              {messages.detail.status}: {team.status}
            </p>
          </div>
        </div>

        <div className="grid gap-6 p-5 md:p-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-4">
            <div className="flex items-center gap-2">
              <Eye aria-hidden="true" className="size-4 text-accent" />
              <h2 className="text-xl font-semibold">{messages.detail.overview}</h2>
            </div>
            <MarkdownContent value={team.description} emptyLabel={messages.detail.emptyDescription} />
          </div>

          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{messages.detail.membershipTitle}</CardTitle>
                <CardDescription>
                  {viewerMembership
                    ? messages.detail.membershipDescription
                    : messages.detail.publicDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 rounded-md border border-border bg-muted p-3">
                  <ShieldCheck aria-hidden="true" className="size-4 text-accent" />
                  <span className="text-sm">
                    {viewerMembership?.role ?? messages.detail.publicViewer}
                  </span>
                </div>
              </CardContent>
            </Card>

            {canManage ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users aria-hidden="true" className="size-4" />
                      {messages.detail.membersTitle}
                    </CardTitle>
                    <CardDescription>{messages.detail.membersDescription}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" disabled type="button" variant="outline">
                      {messages.detail.disabledAction}
                    </Button>
                  </CardContent>
                </Card>
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
