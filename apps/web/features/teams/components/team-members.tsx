'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar'
import { Button } from '@repo/ui/button'
import { Card } from '@repo/ui/card'
import { Separator } from '@repo/ui/separator'
import { MailPlus, Users } from 'lucide-react'
import { Badge } from '@repo/ui/badge'
import { withLocale } from '~/lib/i18n/config'
import { useI18n, useTranslations } from '~/lib/i18n/client'
import { useTeam } from '../hooks/team-provider'

export function TeamMembers() {
  const { locale } = useI18n()
  const t = useTranslations('teams')
  const { team } = useTeam()
  const viewerMembership = team.viewerMembership
  const canManage = Boolean(viewerMembership?.canManage)

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Users aria-hidden="true" className="size-4" />
            {t('detail.membersTitle')}
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {t('detail.membersDescription')}
          </p>
        </div>
        {canManage ? (
          <Button type="button" variant="outline" onClick={() => {}}>
            <MailPlus aria-hidden="true" className="size-4" />
            {t('detail.inviteButton')}
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
            {t('detail.emptyMembers')}
          </Card>
        )}
      </div>
    </section>
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
