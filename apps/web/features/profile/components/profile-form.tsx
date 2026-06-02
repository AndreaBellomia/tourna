'use client'

import Link from 'next/link'
import { useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Camera, Eye, FilePenLine, Save, Trash2 } from 'lucide-react'
import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Label } from '@repo/ui/label'
import { Textarea } from '@repo/ui/textarea'
import {
  UpdateProfileRequestSchema,
  type ProfileSummaryResponse,
  type UpdateProfileInput,
} from '@repo/contracts'
import { type Locale, withLocale } from '../../../lib/i18n/config'
import type { Messages } from '../../../lib/i18n/web-i18n'
import { readZodFieldErrors } from '../../common/services/client-validation'
import { MarkdownContent } from '../../teams/components/markdown-content'
import { updateProfile, uploadProfileAvatar } from '../services/profile-client'

type ProfileFormProps = {
  locale: Locale
  messages: Messages['profile']
  profile: ProfileSummaryResponse
}

export function ProfileForm({ locale, messages, profile }: ProfileFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [currentProfile, setCurrentProfile] = useState(profile)
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [notice, setNotice] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isUploading, startUploadTransition] = useTransition()
  const form = useForm<UpdateProfileInput>({
    defaultValues: {
      display_name: profile.display_name,
      bio: profile.bio ?? '',
      avatarObjectKey: profile.avatarObjectKey,
    },
  })
  const bio = form.watch('bio')
  const displayName = form.watch('display_name')
  const avatarObjectKey = form.watch('avatarObjectKey')
  const avatarUrl =
    avatarObjectKey === currentProfile.avatarObjectKey ? currentProfile.avatarUrl : pendingAvatarUrl
  const initials = useMemo(
    () =>
      (displayName ?? currentProfile.display_name)
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    [currentProfile.display_name, displayName],
  )

  function onSubmit(values: UpdateProfileInput) {
    const parsed = UpdateProfileRequestSchema.safeParse({
      ...values,
      bio: values.bio || null,
      avatarObjectKey: values.avatarObjectKey || null,
    })
    setNotice(null)

    if (!parsed.success) {
      const fieldErrors = readZodFieldErrors(parsed.error)
      for (const [field, issues] of Object.entries(fieldErrors)) {
        form.setError(field as keyof UpdateProfileInput, {
          message: issues?.[0] ?? messages.form.invalid,
        })
      }
      return
    }

    startTransition(() => {
      void updateProfile(parsed.data)
        .then((savedProfile) => {
          setCurrentProfile(savedProfile)
          setPendingAvatarUrl(null)
          form.reset({
            display_name: savedProfile.display_name,
            bio: savedProfile.bio ?? '',
            avatarObjectKey: savedProfile.avatarObjectKey,
          })
          setNotice(messages.form.saved)
          router.refresh()
        })
        .catch((error: unknown) => {
          setNotice(error instanceof Error ? error.message : messages.form.failed)
        })
    })
  }

  function onAvatarSelected(file: File | undefined) {
    if (!file) return

    setNotice(null)
    if (file.size > 4 * 1024 * 1024) {
      setNotice(messages.form.uploadFailed)
      return
    }

    const localPreviewUrl = URL.createObjectURL(file)
    setPendingAvatarUrl(localPreviewUrl)

    startUploadTransition(() => {
      void uploadProfileAvatar(currentProfile, file)
        .then((object) => {
          setPendingAvatarUrl(object.publicUrl ?? localPreviewUrl)
          form.setValue('avatarObjectKey', object.key, {
            shouldDirty: true,
            shouldValidate: true,
          })
          setNotice(messages.form.saved)
        })
        .catch((error: unknown) => {
          setNotice(error instanceof Error ? error.message : messages.form.uploadFailed)
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
            <h1 className="mt-1 text-3xl font-semibold">{messages.form.title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {messages.form.description}
            </p>
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
            <Label htmlFor="profile-display-name">{messages.form.displayName}</Label>
            <Input
              id="profile-display-name"
              placeholder={messages.form.displayNamePlaceholder}
              {...form.register('display_name')}
            />
            <FieldError message={form.formState.errors.display_name?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-bio">{messages.form.bio}</Label>
            {viewMode === 'edit' ? (
              <Textarea
                id="profile-bio"
                className="min-h-80 font-mono text-sm leading-6"
                placeholder={messages.form.bioPlaceholder}
                {...form.register('bio')}
              />
            ) : (
              <div className="min-h-80 rounded-md border border-border bg-background p-4">
                <MarkdownContent value={bio} emptyLabel={messages.form.emptyPreview} />
              </div>
            )}
            <FieldError message={form.formState.errors.bio?.message} />
          </div>
        </div>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="group relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted text-2xl font-semibold">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" className="size-full object-cover" src={avatarUrl} />
              ) : (
                initials || 'U'
              )}
              <Button
                aria-label={messages.form.upload}
                className="absolute bottom-2 right-2 size-9 border border-border bg-background/95 shadow-sm"
                loading={isUploading}
                size="icon"
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera aria-hidden="true" className="size-4" />
              </Button>
            </div>
            <div className="min-w-0">
              <p className="font-semibold">{messages.form.avatar}</p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                {messages.form.avatarHelp}
              </p>
              {avatarObjectKey ? (
                <Button
                  className="mt-3 h-8 px-2 text-xs"
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setPendingAvatarUrl(null)
                    form.setValue('avatarObjectKey', null, { shouldDirty: true })
                  }}
                >
                  <Trash2 aria-hidden="true" className="size-3.5" />
                  {messages.form.removeAvatar}
                </Button>
              ) : null}
            </div>
          </div>

          <input
            ref={fileInputRef}
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            type="file"
            onChange={(event) => onAvatarSelected(event.target.files?.[0])}
          />
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="profile-email">{messages.form.email}</Label>
            <Input id="profile-email" disabled value={currentProfile.email} />
          </div>

          {notice ? (
            <p className="mt-4 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
              {notice}
            </p>
          ) : null}

          <Button className="mt-5 w-full" loading={isPending} size="lg">
            <Save aria-hidden="true" className="size-4" />
            {messages.form.save}
          </Button>

          <Link
            className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
            href={withLocale(locale, `/users/${currentProfile.id}`)}
          >
            {messages.form.publicProfile}
          </Link>
        </div>
      </aside>
    </form>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null

  return <p className="text-sm text-destructive">{message}</p>
}
