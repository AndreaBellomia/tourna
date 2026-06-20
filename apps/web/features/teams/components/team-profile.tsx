'use client'

import { Eye } from 'lucide-react'
import { Badge } from '@repo/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card'
import type { Messages } from '~/lib/i18n/web-i18n'
import { MarkdownContent } from './markdown-content'
import { TeamDetailResponse } from '@repo/contracts'

type TeamProfileProps = {
  messages: Messages['teams']
  team: TeamDetailResponse
}

export function TeamProfile({ messages, team }: TeamProfileProps) {
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
