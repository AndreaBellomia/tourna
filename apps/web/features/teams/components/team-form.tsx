'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Eye, FilePenLine, Save } from 'lucide-react'
import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Label } from '@repo/ui/label'
import { Select } from '@repo/ui/select'
import { Textarea } from '@repo/ui/textarea'
import {
  CreateTeamRequestSchema,
  UpdateTeamRequestSchema,
  type CreateTeamInput,
  type TeamDetailResponse,
} from '@repo/contracts'
import { type Locale, withLocale } from '../../../lib/i18n/config'
import type { Messages } from '../../../lib/i18n/web-i18n'
import { readZodFieldErrors, submitTeam, updateTeam } from '../services/team-client'
import { MarkdownContent } from './markdown-content'

const visibilityOptions = ['private', 'unlisted', 'public'] as const

type TeamFormProps = {
  locale: Locale
  messages: Messages['teams']
  mode: 'create' | 'edit'
  team?: TeamDetailResponse
}

export function TeamForm({ locale, messages, mode, team }: TeamFormProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [notice, setNotice] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const form = useForm<CreateTeamInput>({
    defaultValues: {
      name: team?.name ?? '',
      description: team?.description ?? '',
      visibility: team?.visibility ?? 'private',
    },
  })
  const description = form.watch('description')
  const title = mode === 'create' ? messages.form.title : messages.detail.editTitle
  const submitLabel = mode === 'create' ? messages.form.submit : messages.form.save
  const canSubmit = mode === 'create' || team?.viewerMembership?.canManage

  const schema = useMemo(
    () => (mode === 'create' ? CreateTeamRequestSchema : UpdateTeamRequestSchema),
    [mode],
  )

  function onSubmit(values: CreateTeamInput) {
    const parsed = schema.safeParse(values)
    setNotice(null)

    if (!parsed.success) {
      const fieldErrors = readZodFieldErrors(parsed.error)
      for (const [field, issues] of Object.entries(fieldErrors)) {
        form.setError(field as keyof CreateTeamInput, {
          message: issues?.[0] ?? messages.form.invalid,
        })
      }
      return
    }

    startTransition(() => {
      const request =
        mode === 'create'
          ? submitTeam(parsed.data as CreateTeamInput)
          : updateTeam(team?.id ?? '', parsed.data)

      void request
        .then((savedTeam) => {
          setNotice(mode === 'create' ? messages.form.success : messages.form.saved)
          router.push(withLocale(locale, `/teams/${savedTeam.id}`))
          router.refresh()
        })
        .catch((error: unknown) => {
          setNotice(error instanceof Error ? error.message : messages.form.failed)
        })
    })
  }

  return (
    <form
      className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
      onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
    >
      <section className="min-w-0 rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-accent">{messages.form.eyebrow}</p>
            <h1 className="mt-1 text-3xl font-semibold">{title}</h1>
          </div>
          <div className="inline-flex w-fit rounded-md border border-border bg-background p-1">
            <Button
              size="sm"
              type="button"
              variant={viewMode === 'edit' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('edit')}
            >
              <FilePenLine aria-hidden="true" className="size-4" />
              {messages.form.editMode}
            </Button>
            <Button
              size="sm"
              type="button"
              variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('preview')}
            >
              <Eye aria-hidden="true" className="size-4" />
              {messages.form.previewMode}
            </Button>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="team-name">{messages.form.name}</Label>
            <Input
              id="team-name"
              placeholder={messages.form.namePlaceholder}
              {...form.register('name')}
              disabled={!canSubmit}
            />
            <FieldError message={form.formState.errors.name?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-description">{messages.form.summary}</Label>
            {viewMode === 'edit' ? (
              <Textarea
                id="team-description"
                className="min-h-80 font-mono text-sm leading-6"
                placeholder={messages.form.summaryPlaceholder}
                {...form.register('description')}
                disabled={!canSubmit}
              />
            ) : (
              <div className="min-h-80 rounded-md border border-border bg-background p-4">
                <MarkdownContent value={description} emptyLabel={messages.form.emptyPreview} />
              </div>
            )}
            <FieldError message={form.formState.errors.description?.message} />
          </div>
        </div>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="create-team-visibility">{messages.form.visibility}</Label>
            <Select
              id="create-team-visibility"
              {...form.register('visibility')}
              disabled={!canSubmit}
            >
              {visibilityOptions.map((visibility) => (
                <option key={visibility} value={visibility}>
                  {messages.visibility[visibility]}
                </option>
              ))}
            </Select>
          </div>

          {notice ? (
            <p className="mt-4 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
              {notice}
            </p>
          ) : null}

          <Button className="mt-5 w-full" disabled={!canSubmit} loading={isPending} size="lg">
            <Save aria-hidden="true" className="size-4" />
            {submitLabel}
          </Button>
        </div>
      </aside>
    </form>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null

  return <p className="text-sm text-destructive">{message}</p>
}
