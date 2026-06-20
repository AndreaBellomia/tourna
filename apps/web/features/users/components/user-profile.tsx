'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, Eye } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar'
import { Badge } from '@repo/ui/components/badge'
import { buttonVariants } from '@repo/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card'
import type { UserDetailResponse } from '@repo/contracts'
import { withLocale } from '~/lib/i18n/config'
import { useFormatters, useI18n, useTranslations } from '~/lib/i18n/client'
import { MarkdownContent } from '~/features/teams/components/markdown-content'
import { fetchUser } from '~/features/users/services/user-client'

type UserProfileProps = {
  initialUser: UserDetailResponse
}

export function UserProfile({ initialUser }: UserProfileProps) {
  const { locale } = useI18n()
  const format = useFormatters()
  const t = useTranslations('users')
  const [user, setUser] = useState(initialUser)
  const initials = user.display_name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    let active = true

    void fetchUser(initialUser.nickname)
      .then((freshUser) => {
        if (active) setUser(freshUser)
      })
      .catch(() => {
        // Keep the server-rendered public profile if the refresh fails.
      })

    return () => {
      active = false
    }
  }, [initialUser.nickname])

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Link
        className={buttonVariants({ variant: 'outline' })}
        href={withLocale(locale, '/users')}
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t('detail.back')}
      </Link>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-[0_18px_50px_rgba(3,7,18,0.24)]">
        <div className="border-b border-border bg-muted/50 px-5 py-8 text-foreground md:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-20 text-xl">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} />
                ) : (
                  <AvatarFallback>{initials || 'U'}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <Badge variant="outline">@{user.nickname}</Badge>
                <h1 className="mt-3 text-4xl font-semibold tracking-normal md:text-5xl">
                  {user.display_name}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 md:p-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4">
            <div className="flex items-center gap-2">
              <Eye aria-hidden="true" className="size-4 text-accent" />
              <h2 className="text-xl font-semibold">{t('detail.overview')}</h2>
            </div>
            <MarkdownContent value={user.bio} emptyLabel={t('detail.emptyBio')} />
          </div>

          <aside>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarDays aria-hidden="true" className="size-4" />
                  {t('detail.joined')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-sm text-muted-foreground">
                  {format.date(user.createdAt)}
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </div>
  )
}
