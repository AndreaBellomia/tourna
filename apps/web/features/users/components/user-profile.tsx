'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, Eye } from 'lucide-react'
import { Badge } from '@repo/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card'
import type { UserDetailResponse } from '@repo/contracts'
import { type Locale, withLocale } from '~/lib/i18n/config'
import type { Messages } from '~/lib/i18n/web-i18n'
import { MarkdownContent } from '~/features/teams/components/markdown-content'
import { fetchUser } from '~/features/users/services/user-client'

type UserProfileProps = {
  locale: Locale
  messages: Messages['users']
  initialUser: UserDetailResponse
}

export function UserProfile({ locale, messages, initialUser }: UserProfileProps) {
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
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        href={withLocale(locale, '/users')}
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {messages.detail.back}
      </Link>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-secondary px-5 py-10 text-secondary-foreground md:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-background text-xl font-semibold text-foreground">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" className="size-full object-cover" src={user.avatarUrl} />
                ) : (
                  initials || 'U'
                )}
              </div>
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
              <h2 className="text-xl font-semibold">{messages.detail.overview}</h2>
            </div>
            <MarkdownContent value={user.bio} emptyLabel={messages.detail.emptyBio} />
          </div>

          <aside>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarDays aria-hidden="true" className="size-4" />
                  {messages.detail.joined}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString(locale)}
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </div>
  )
}
