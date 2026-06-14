'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import {
  ArrowRight,
  CheckCircle2,
  Filter,
  Plus,
  Search,
  Shield,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react'
import { Alert } from '@repo/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar'
import { Badge } from '@repo/ui/badge'
import { Button, buttonVariants } from '@repo/ui/button'
import { cardVariants } from '@repo/ui/card'
import { Input } from '@repo/ui/input'
import { Label } from '@repo/ui/label'
import { Select } from '@repo/ui/select'
import { cn } from '@repo/ui/utils'
import { type TeamListResponse, type TeamSummaryResponse } from '@repo/contracts'
import { EmptyState } from '~/features/common/components/empty-state'
import { ListToolbar } from '~/features/common/components/list-toolbar'
import { PageHeader } from '~/features/common/components/page-header'
import { type Locale, withLocale } from '~/lib/i18n/config'
import type { Messages } from '~/lib/i18n/web-i18n'
import { fetchTeams } from '~/features/teams/services/team-client'
import { MarkdownContent } from './markdown-content'

const PAGE_SIZE = 12
const visibilityOptions = ['private', 'unlisted', 'public'] as const

type TeamExplorerProps = {
  locale: Locale
  messages: Messages['teams']
  initialPage: TeamListResponse | null
  initialError?: string
}

type SearchValues = {
  search: string
  visibility: (typeof visibilityOptions)[number] | 'all'
}

export function TeamExplorer({ locale, messages, initialPage, initialError }: TeamExplorerProps) {
  const [teams, setTeams] = useState<TeamSummaryResponse[]>(initialPage?.data ?? [])
  const [pageInfo, setPageInfo] = useState(initialPage?.pageInfo ?? null)
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [isPending, startTransition] = useTransition()
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const activeQueryRef = useRef<SearchValues>({ search: '', visibility: 'all' })
  const searchForm = useForm<SearchValues>({
    defaultValues: { search: '', visibility: 'all' },
  })
  const searchValue = searchForm.watch('search')
  const visibilityValue = searchForm.watch('visibility')

  const queryFromValues = useCallback((values: SearchValues, cursor?: string) => {
    return {
      limit: PAGE_SIZE,
      direction: 'next' as const,
      ...(values.search.trim() ? { search: values.search.trim() } : {}),
      ...(values.visibility !== 'all' ? { visibility: values.visibility } : {}),
      ...(cursor ? { cursor } : {}),
    }
  }, [])

  const loadFirstPage = useCallback(
    (values: SearchValues) => {
      activeQueryRef.current = values
      setError(null)

      startTransition(() => {
        void fetchTeams(queryFromValues(values))
          .then((page) => {
            setTeams(page.data)
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
      void fetchTeams(queryFromValues(activeQueryRef.current, nextCursor))
        .then((page) => {
          setTeams((current) => mergeTeams(current, page.data))
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

  const hasTeams = teams.length > 0
  const resultLabel = useMemo(() => `${teams.length} team`, [teams.length])
  const hasActiveFilters = Boolean(searchValue.trim()) || visibilityValue !== 'all'

  function resetFilters() {
    const values: SearchValues = { search: '', visibility: 'all' }

    searchForm.reset(values)
    loadFirstPage(values)
  }

  return (
    <section className="space-y-5">
      <PageHeader
        badgeIcon={<Users aria-hidden="true" className="size-3.5" />}
        description={messages.list.description}
        eyebrow={messages.list.eyebrow}
        title={messages.list.title}
        actions={
          <>
            <Badge variant="outline" className="w-fit">
              {resultLabel}
            </Badge>
            <Link className={buttonVariants()} href={withLocale(locale, '/teams/new')}>
              <Plus aria-hidden="true" className="size-4" />
              {messages.list.create}
            </Link>
          </>
        }
      />

      <form onSubmit={(event) => void searchForm.handleSubmit(loadFirstPage)(event)}>
        <ListToolbar
          resetDisabled={!hasActiveFilters}
          resetLabel={messages.list.reset}
          onReset={resetFilters}
          activeFilters={
            <>
              {searchValue.trim() ? <Badge variant="accent">{searchValue.trim()}</Badge> : null}
              {visibilityValue !== 'all' ? (
                <Badge variant="outline">{messages.visibility[visibilityValue]}</Badge>
              ) : null}
            </>
          }
        >
          <div className="space-y-2">
            <Label className="inline-flex items-center gap-2" htmlFor="team-search">
              <SlidersHorizontal aria-hidden="true" className="size-4 text-accent" />
              {messages.list.search}
            </Label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="team-search"
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
                    const values = { ...activeQueryRef.current, search: '' }
                    searchForm.reset(values)
                    loadFirstPage(values)
                  }}
                >
                  <X aria-hidden="true" className="size-4" />
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-visibility">{messages.list.visibility}</Label>
            <div className="relative">
              <Filter
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Select
                id="team-visibility"
                className="h-11 pl-9"
                options={[
                  { value: 'all', label: messages.list.allVisibilities },
                  ...visibilityOptions.map((visibility) => ({
                    value: visibility,
                    label: messages.visibility[visibility],
                  })),
                ]}
                value={visibilityValue}
                onValueChange={(value) =>
                  searchForm.setValue('visibility', value as SearchValues['visibility'])
                }
              />
            </div>
          </div>

          <Button className="h-11 lg:w-44" loading={isPending} type="submit">
            <Search aria-hidden="true" className="size-4" />
            {messages.list.search}
          </Button>
        </ListToolbar>
      </form>

      {error ? (
        <Alert variant="destructive">{error}</Alert>
      ) : null}

      {hasTeams ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <TeamTile key={team.id} locale={locale} messages={messages} team={team} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={messages.list.emptyTitle}
          description={error ? messages.list.unavailable : messages.list.emptyDescription}
          action={
            <Link
              className={buttonVariants({ variant: 'outline' })}
              href={withLocale(locale, '/teams/new')}
            >
              <Plus aria-hidden="true" className="size-4" />
              {messages.list.create}
            </Link>
          }
        />
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

function TeamTile({
  locale,
  messages,
  team,
}: {
  locale: Locale
  messages: Messages['teams']
  team: TeamSummaryResponse
}) {
  const initials = team.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Link
      className={cn(cardVariants({ variant: 'interactive' }), 'group block p-4')}
      href={withLocale(locale, `/teams/${team.slug}`)}
    >
      <div className="flex items-start gap-3">
        <Avatar className="size-12 border-primary/25 bg-primary/15">
          {team.logoUrl ? (
            <AvatarImage src={team.logoUrl} />
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials || 'TM'}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-semibold">{team.name}</p>
            <ArrowRight
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
            />
          </div>
          <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
            @{team.slug} · [{team.tag}]
          </p>
        </div>
      </div>

      <div className="mt-3 line-clamp-2 min-h-11">
        <MarkdownContent value={team.description} emptyLabel={messages.detail.emptyDescription} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Badge variant={team.visibility === 'public' ? 'success' : 'outline'}>
          {messages.visibility[team.visibility]}
        </Badge>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          {team.status === 'published' ? (
            <CheckCircle2 aria-hidden="true" className="size-3.5 text-success" />
          ) : (
            <Shield aria-hidden="true" className="size-3.5" />
          )}
          {team.status}
        </span>
      </div>
    </Link>
  )
}

function mergeTeams(current: TeamSummaryResponse[], incoming: TeamSummaryResponse[]) {
  const known = new Set(current.map((team) => team.id))
  const merged = [...current]

  for (const team of incoming) {
    if (!known.has(team.id)) {
      merged.push(team)
    }
  }

  return merged
}
