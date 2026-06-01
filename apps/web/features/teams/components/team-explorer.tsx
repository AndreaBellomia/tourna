'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowRight, CheckCircle2, Filter, Plus, Search, Shield, Users } from 'lucide-react'
import { Badge } from '@repo/ui/badge'
import { Button } from '@repo/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card'
import { Input } from '@repo/ui/input'
import { Label } from '@repo/ui/label'
import { Select } from '@repo/ui/select'
import { Textarea } from '@repo/ui/textarea'
import {
  CreateTeamRequestSchema,
  type CreateTeamInput,
  type TeamListResponse,
  type TeamSummaryResponse,
} from '@repo/contracts'
import { type Locale, withLocale } from '../../../lib/i18n/config'
import type { Messages } from '../../../lib/i18n/web-i18n'
import { fetchTeams, readZodFieldErrors, submitTeam } from '../services/team-client'

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
  const [notice, setNotice] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const activeQueryRef = useRef<SearchValues>({ search: '', visibility: 'all' })
  const searchForm = useForm<SearchValues>({
    defaultValues: { search: '', visibility: 'all' },
  })
  const createForm = useForm<CreateTeamInput>({
    defaultValues: { name: '', description: '', visibility: 'private' },
  })

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
      setNotice(null)

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

  function onCreate(values: CreateTeamInput) {
    const parsed = CreateTeamRequestSchema.safeParse(values)
    setNotice(null)

    if (!parsed.success) {
      const fieldErrors = readZodFieldErrors(parsed.error)
      for (const [field, issues] of Object.entries(fieldErrors)) {
        createForm.setError(field as keyof CreateTeamInput, {
          message: issues?.[0] ?? messages.form.invalid,
        })
      }
      return
    }

    startTransition(() => {
      void submitTeam(parsed.data)
        .then((team) => {
          setTeams((current) => mergeTeams([team], current))
          createForm.reset({ name: '', description: '', visibility: 'private' })
          setNotice(messages.form.success)
        })
        .catch((createError: unknown) => {
          setNotice(createError instanceof Error ? createError.message : messages.form.failed)
        })
    })
  }

  const hasTeams = teams.length > 0
  const resultLabel = useMemo(() => `${teams.length} team`, [teams.length])

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="min-w-0 space-y-5">
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
          <Badge variant="outline" className="w-fit">
            {resultLabel}
          </Badge>
        </div>

        <form
          className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[minmax(0,1fr)_190px_auto_auto]"
          onSubmit={(event) => void searchForm.handleSubmit(loadFirstPage)(event)}
        >
          <div className="space-y-2">
            <Label htmlFor="team-search">{messages.list.search}</Label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="team-search"
                placeholder={messages.list.searchPlaceholder}
                className="pl-9"
                {...searchForm.register('search')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-visibility">{messages.list.visibility}</Label>
            <div className="relative">
              <Filter
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Select id="team-visibility" className="pl-9" {...searchForm.register('visibility')}>
                <option value="all">{messages.list.allVisibilities}</option>
                {visibilityOptions.map((visibility) => (
                  <option key={visibility} value={visibility}>
                    {messages.visibility[visibility]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <Button className="self-end" loading={isPending} type="submit">
            <Search aria-hidden="true" className="size-4" />
            {messages.list.search}
          </Button>
          <Button
            className="self-end"
            type="button"
            variant="outline"
            onClick={() => {
              searchForm.reset({ search: '', visibility: 'all' })
              loadFirstPage({ search: '', visibility: 'all' })
            }}
          >
            {messages.list.reset}
          </Button>
        </form>

        {error ? (
          <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {hasTeams ? (
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
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

      <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg">{messages.form.title}</CardTitle>
              <div className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Plus aria-hidden="true" className="size-4" />
              </div>
            </div>
            <CardDescription>{messages.form.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event) => void createForm.handleSubmit(onCreate)(event)}
            >
              <div className="space-y-2">
                <Label htmlFor="team-name">{messages.form.name}</Label>
                <Input
                  id="team-name"
                  placeholder={messages.form.namePlaceholder}
                  {...createForm.register('name')}
                />
                <FieldError message={createForm.formState.errors.name?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team-description">{messages.form.summary}</Label>
                <Textarea
                  id="team-description"
                  placeholder={messages.form.summaryPlaceholder}
                  {...createForm.register('description')}
                />
                <FieldError message={createForm.formState.errors.description?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-team-visibility">{messages.form.visibility}</Label>
                <Select id="create-team-visibility" {...createForm.register('visibility')}>
                  {visibilityOptions.map((visibility) => (
                    <option key={visibility} value={visibility}>
                      {messages.visibility[visibility]}
                    </option>
                  ))}
                </Select>
              </div>

              {notice ? (
                <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                  {notice}
                </p>
              ) : null}

              <Button className="w-full" loading={isPending} size="lg" type="submit">
                {messages.form.submit}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </aside>
    </div>
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
      className="group rounded-lg border border-border bg-card p-4 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
      href={withLocale(locale, `/teams/${team.id}`)}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
          {initials || 'TM'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-semibold">{team.name}</p>
            <ArrowRight
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
            />
          </div>
          <p className="mt-1 truncate font-mono text-xs text-muted-foreground">@{team.slug}</p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 min-h-11 text-sm leading-6 text-muted-foreground">
        {team.description ?? 'Team profile in progress.'}
      </p>

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

function FieldError({ message }: { message?: string }) {
  if (!message) return null

  return <p className="text-sm text-destructive">{message}</p>
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
