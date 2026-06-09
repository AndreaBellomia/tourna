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
import { Badge } from '@repo/ui/badge'
import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Label } from '@repo/ui/label'
import { Select } from '@repo/ui/select'
import { type TeamListResponse, type TeamSummaryResponse } from '@repo/contracts'
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

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <Badge variant="secondary" className="mb-3 gap-1.5">
            <Users aria-hidden="true" className="size-3.5" />
            {messages.list.eyebrow}
          </Badge>
          <h1 className="text-3xl font-semibold tracking-normal md:text-4xl">
            {messages.list.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {messages.list.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="w-fit">
            {resultLabel}
          </Badge>
          <Link
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            href={withLocale(locale, '/teams/new')}
          >
            <Plus aria-hidden="true" className="size-4" />
            {messages.list.create}
          </Link>
        </div>
      </div>

      <form
        className="rounded-lg border border-border bg-card p-3 shadow-sm"
        onSubmit={(event) => void searchForm.handleSubmit(loadFirstPage)(event)}
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end">
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
                {...searchForm.register('visibility')}
              >
                <option value="all">{messages.list.allVisibilities}</option>
                {visibilityOptions.map((visibility) => (
                  <option key={visibility} value={visibility}>
                    {messages.visibility[visibility]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <Button className="h-11 lg:w-44" loading={isPending} type="submit">
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

      {hasTeams ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <TeamTile key={team.id} locale={locale} messages={messages} team={team} />
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
      className="group rounded-lg border border-border bg-card p-4 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-md"
      href={withLocale(locale, `/teams/${team.slug}`)}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
          {team.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="size-full rounded-md object-cover" src={team.logoUrl} />
          ) : (
            initials || 'TM'
          )}
        </div>
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
