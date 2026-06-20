'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowRight, Search, SlidersHorizontal, UserRound, X } from 'lucide-react'
import { Alert } from '@repo/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar'
import { Badge } from '@repo/ui/badge'
import { cardVariants } from '@repo/ui/card'
import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Label } from '@repo/ui/label'
import { cn } from '@repo/ui/utils'
import type { UserListResponse, UserSummaryResponse } from '@repo/contracts'
import { EmptyState } from '~/features/common/components/empty-state'
import { ListToolbar } from '~/features/common/components/list-toolbar'
import { PageHeader } from '~/features/common/components/page-header'
import { withLocale } from '~/lib/i18n/config'
import { useI18n, useTranslations } from '~/lib/i18n/client'
import { MarkdownContent } from '~/features/teams/components/markdown-content'
import { fetchUsers } from '~/features/users/services/user-client'

const PAGE_SIZE = 12

type UserExplorerProps = {
  initialPage: UserListResponse | null
  initialError?: string
}

type SearchValues = {
  search: string
}

export function UserExplorer({ initialPage, initialError }: UserExplorerProps) {
  const t = useTranslations('users')
  const [users, setUsers] = useState<UserSummaryResponse[]>(initialPage?.data ?? [])
  const [pageInfo, setPageInfo] = useState(initialPage?.pageInfo ?? null)
  const [error, setError] = useState<string | null>(
    initialError ?? (initialPage ? null : t('list.unavailable')),
  )
  const [isLoading, setIsLoading] = useState(false)
  const activeRequestRef = useRef<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const activeQueryRef = useRef<SearchValues>({ search: '' })
  const searchForm = useForm<SearchValues>({
    defaultValues: { search: '' },
  })
  const searchValue = searchForm.watch('search')
  const hasActiveFilters = Boolean(searchValue.trim())

  const queryFromValues = useCallback((values: SearchValues, cursor?: string) => {
    return {
      limit: PAGE_SIZE,
      direction: 'next' as const,
      ...(values.search.trim() ? { search: values.search.trim() } : {}),
      ...(cursor ? { cursor } : {}),
    }
  }, [])

  const beginLoad = useCallback((requestKey: string) => {
    if (activeRequestRef.current) return false

    activeRequestRef.current = requestKey
    setIsLoading(true)

    return true
  }, [])

  const finishLoad = useCallback((requestKey: string) => {
    if (activeRequestRef.current !== requestKey) return

    activeRequestRef.current = null
    setIsLoading(false)
  }, [])

  const loadFirstPage = useCallback(
    (values: SearchValues) => {
      const requestKey = `first:${values.search.trim()}`
      if (!beginLoad(requestKey)) return

      activeQueryRef.current = values
      setError(null)

      void fetchUsers(queryFromValues(values))
        .then((page) => {
          setUsers(page.data)
          setPageInfo(page.pageInfo)
        })
        .catch((loadError: unknown) => {
          setError(loadError instanceof Error ? loadError.message : t('list.unavailable'))
        })
        .finally(() => finishLoad(requestKey))
    },
    [beginLoad, finishLoad, queryFromValues, t],
  )

  function resetFilters() {
    searchForm.reset({ search: '' })
    loadFirstPage({ search: '' })
  }

  const loadNextPage = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.nextCursor || activeRequestRef.current) return

    const nextCursor = pageInfo.nextCursor
    const requestKey = `next:${nextCursor}`
    if (!beginLoad(requestKey)) return

    void fetchUsers(queryFromValues(activeQueryRef.current, nextCursor))
      .then((page) => {
        setUsers((current) => mergeUsers(current, page.data))
        setPageInfo(page.pageInfo)
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : t('list.unavailable'))
      })
      .finally(() => finishLoad(requestKey))
  }, [beginLoad, finishLoad, pageInfo, queryFromValues, t])

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
      <PageHeader
        badgeIcon={<UserRound aria-hidden="true" className="size-3.5" />}
        description={t('list.description')}
        eyebrow={t('list.eyebrow')}
        title={t('list.title')}
        actions={
          <Badge variant="outline" className="w-fit">
            {users.length} user
          </Badge>
        }
      />

      <form onSubmit={(event) => void searchForm.handleSubmit(loadFirstPage)(event)}>
        <ListToolbar
          resetDisabled={!hasActiveFilters}
          resetLabel={t('list.reset')}
          onReset={resetFilters}
          activeFilters={
            searchValue.trim() ? <Badge variant="accent">{searchValue.trim()}</Badge> : null
          }
        >
          <div className="min-w-0 flex-1 space-y-2">
            <Label className="inline-flex items-center gap-2" htmlFor="user-search">
              <SlidersHorizontal aria-hidden="true" className="size-4 text-accent" />
              {t('list.search')}
            </Label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="user-search"
                placeholder={t('list.searchPlaceholder')}
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

          <Button className="h-11 md:w-44" loading={isLoading} type="submit">
            <Search aria-hidden="true" className="size-4" />
            {t('list.search')}
          </Button>
        </ListToolbar>
      </form>

      {error ? (
        <Alert variant="destructive">{error}</Alert>
      ) : null}

      {users.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => (
            <UserTile key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={t('list.emptyTitle')}
          description={error ? t('list.unavailable') : t('list.emptyDescription')}
        />
      )}

      <div ref={sentinelRef} className="h-1" />
      {pageInfo?.hasNextPage ? (
        <div className="flex justify-center">
          <Button loading={isLoading} type="button" variant="outline" onClick={loadNextPage}>
            {t('list.loadMore')}
          </Button>
        </div>
      ) : null}
    </section>
  )
}

function UserTile({ user }: { user: UserSummaryResponse }) {
  const { locale } = useI18n()
  const t = useTranslations('users')
  const initials = user.display_name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Link
      className={cn(cardVariants({ variant: 'interactive' }), 'group block p-4')}
      href={withLocale(locale, `/users/${user.nickname}`)}
    >
      <div className="flex items-start gap-3">
        <Avatar className="size-12">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} />
          ) : (
            <AvatarFallback>{initials || 'U'}</AvatarFallback>
          )}
        </Avatar>
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
        <MarkdownContent value={user.bio} emptyLabel={t('detail.emptyBio')} />
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
