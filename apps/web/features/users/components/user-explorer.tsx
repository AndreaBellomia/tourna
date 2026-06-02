'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowRight, Search, SlidersHorizontal, UserRound, X } from 'lucide-react'
import { Badge } from '@repo/ui/badge'
import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Label } from '@repo/ui/label'
import type { UserListResponse, UserSummaryResponse } from '@repo/contracts'
import { type Locale, withLocale } from '../../../lib/i18n/config'
import type { Messages } from '../../../lib/i18n/web-i18n'
import { MarkdownContent } from '../../teams/components/markdown-content'
import { fetchUsers } from '../services/user-client'

const PAGE_SIZE = 12

type UserExplorerProps = {
  locale: Locale
  messages: Messages['users']
  initialPage: UserListResponse | null
  initialError?: string
}

type SearchValues = {
  search: string
}

export function UserExplorer({ locale, messages, initialPage, initialError }: UserExplorerProps) {
  const [users, setUsers] = useState<UserSummaryResponse[]>(initialPage?.data ?? [])
  const [pageInfo, setPageInfo] = useState(initialPage?.pageInfo ?? null)
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [isPending, startTransition] = useTransition()
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const activeQueryRef = useRef<SearchValues>({ search: '' })
  const searchForm = useForm<SearchValues>({
    defaultValues: { search: '' },
  })
  const searchValue = searchForm.watch('search')

  const queryFromValues = useCallback((values: SearchValues, cursor?: string) => {
    return {
      limit: PAGE_SIZE,
      direction: 'next' as const,
      ...(values.search.trim() ? { search: values.search.trim() } : {}),
      ...(cursor ? { cursor } : {}),
    }
  }, [])

  const loadFirstPage = useCallback(
    (values: SearchValues) => {
      activeQueryRef.current = values
      setError(null)

      startTransition(() => {
        void fetchUsers(queryFromValues(values))
          .then((page) => {
            setUsers(page.data)
            setPageInfo(page.pageInfo)
          })
          .catch((loadError: unknown) => {
            setError(loadError instanceof Error ? loadError.message : messages.list.unavailable)
          })
      })
    },
    [messages.list.unavailable, queryFromValues],
  )

  const loadNextPage = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.nextCursor || isPending) return

    const nextCursor = pageInfo.nextCursor

    startTransition(() => {
      void fetchUsers(queryFromValues(activeQueryRef.current, nextCursor))
        .then((page) => {
          setUsers((current) => mergeUsers(current, page.data))
          setPageInfo(page.pageInfo)
        })
        .catch((loadError: unknown) => {
          setError(loadError instanceof Error ? loadError.message : messages.list.unavailable)
        })
    })
  }, [isPending, messages.list.unavailable, pageInfo, queryFromValues])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          loadNextPage()
        }
      },
      { rootMargin: '320px' },
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [loadNextPage])

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <Badge variant="secondary" className="mb-3 gap-1.5">
            <UserRound aria-hidden="true" className="size-3.5" />
            {messages.list.eyebrow}
          </Badge>
          <h1 className="text-3xl font-semibold tracking-normal md:text-4xl">
            {messages.list.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {messages.list.description}
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          {users.length} user
        </Badge>
      </div>

      <form
        className="rounded-lg border border-border bg-card p-3 shadow-sm"
        onSubmit={(event) => void searchForm.handleSubmit(loadFirstPage)(event)}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="min-w-0 flex-1 space-y-2">
            <Label className="inline-flex items-center gap-2" htmlFor="user-search">
              <SlidersHorizontal aria-hidden="true" className="size-4 text-accent" />
              {messages.list.search}
            </Label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="user-search"
                placeholder={messages.list.searchPlaceholder}
                className="h-11 pr-11 pl-9"
                {...searchForm.register('search')}
              />
              {searchValue ? (
                <Button
                  aria-label="Clear search"
                  className="absolute right-1 top-1/2 size-9 -translate-y-1/2"
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    searchForm.reset({ search: '' })
                    loadFirstPage({ search: '' })
                  }}
                >
                  <X aria-hidden="true" className="size-4" />
                </Button>
              ) : null}
            </div>
          </div>

          <Button className="h-11 md:w-44" loading={isPending} type="submit">
            <Search aria-hidden="true" className="size-4" />
            {messages.list.search}
          </Button>
        </div>
      </form>

      {error ? (
        <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {users.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => (
            <UserTile key={user.id} locale={locale} messages={messages} user={user} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-card px-5 py-10 text-center">
          <p className="text-lg font-semibold">{messages.list.emptyTitle}</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {error ? messages.list.unavailable : messages.list.emptyDescription}
          </p>
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />
      {pageInfo?.hasNextPage ? (
        <div className="flex justify-center">
          <Button loading={isPending} type="button" variant="outline" onClick={loadNextPage}>
            {messages.list.loadMore}
          </Button>
        </div>
      ) : null}
    </section>
  )
}

function UserTile({
  locale,
  messages,
  user,
}: {
  locale: Locale
  messages: Messages['users']
  user: UserSummaryResponse
}) {
  const initials = user.display_name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Link
      className="group rounded-lg border border-border bg-card p-4 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-md"
      href={withLocale(locale, `/users/${user.nickname}`)}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary text-sm font-semibold text-secondary-foreground">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="size-full object-cover" src={user.avatarUrl} />
          ) : (
            initials || 'U'
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-semibold">{user.display_name}</p>
            <ArrowRight
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
            />
          </div>
          <p className="mt-1 truncate font-mono text-xs text-muted-foreground">@{user.nickname}</p>
        </div>
      </div>

      <div className="mt-3 line-clamp-2 min-h-11">
        <MarkdownContent value={user.bio} emptyLabel={messages.detail.emptyBio} />
      </div>
    </Link>
  )
}

function mergeUsers(current: UserSummaryResponse[], incoming: UserSummaryResponse[]) {
  const known = new Set(current.map((user) => user.id))
  const merged = [...current]

  for (const user of incoming) {
    if (!known.has(user.id)) {
      merged.push(user)
    }
  }

  return merged
}
