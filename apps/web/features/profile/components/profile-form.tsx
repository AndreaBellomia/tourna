'use client'

import Link from 'next/link'
import { useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Save } from 'lucide-react'
import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Label } from '@repo/ui/label'
import {
  UpdateProfileRequestSchema,
  type ProfileSummaryResponse,
  type UpdateProfileInput,
} from '@repo/contracts'
import { type Locale, withLocale } from '~/lib/i18n/config'
import type { Messages } from '~/lib/i18n/web-i18n'
import {
  EditorFormHeader,
  EditorFormLayout,
  FieldError,
  FormNotice,
  ImageUploadControl,
  MarkdownEditorField,
  type EditorViewMode,
} from '~/features/common/components/editor-form'
import { useZodSubmit } from '~/features/common/services/form-submit'
import { updateProfile, uploadProfileAvatar } from '~/features/profile/services/profile-client'

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
  const [viewMode, setViewMode] = useState<EditorViewMode>('edit')
  const [isUploading, startUploadTransition] = useTransition()
  const form = useForm<UpdateProfileInput>({
    defaultValues: {
      display_name: profile.display_name,
      nickname: profile.nickname,
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
  const submitState = useZodSubmit({
    failedMessage: messages.form.failed,
    form,
    invalidMessage: messages.form.invalid,
    normalize: (values) => ({
      ...values,
      bio: values.bio || null,
      avatarObjectKey: values.avatarObjectKey || null,
    }),
    schema: UpdateProfileRequestSchema,
    submit: updateProfile,
    onSuccess: (savedProfile, { setNotice }) => {
      setCurrentProfile(savedProfile)
      setPendingAvatarUrl(null)
      form.reset({
        display_name: savedProfile.display_name,
        nickname: savedProfile.nickname,
        bio: savedProfile.bio ?? '',
        avatarObjectKey: savedProfile.avatarObjectKey,
      })
      setNotice(messages.form.saved)
      router.refresh()
    },
  })

  function onAvatarSelected(file: File | undefined) {
    if (!file) return

    submitState.setNotice(null)
    if (file.size > 4 * 1024 * 1024) {
      submitState.setNotice(messages.form.uploadFailed)
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
          submitState.setNotice(messages.form.saved)
        })
        .catch((error: unknown) => {
          submitState.setNotice(error instanceof Error ? error.message : messages.form.uploadFailed)
        })
    })
  }

  return (
    <EditorFormLayout
      sidebar={
        <>
          <ImageUploadControl
            actionLabel={messages.form.upload}
            fallbackLabel={initials || 'U'}
            help={messages.form.avatarHelp}
            imageUrl={avatarUrl}
            inputRef={fileInputRef}
            isUploading={isUploading}
            label={messages.form.avatar}
            removeLabel={avatarObjectKey ? messages.form.removeAvatar : undefined}
            onFileSelected={onAvatarSelected}
            onRemove={
              avatarObjectKey
                ? () => {
                    setPendingAvatarUrl(null)
                    form.setValue('avatarObjectKey', null, { shouldDirty: true })
                  }
                : undefined
            }
          />

          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="profile-email">{messages.form.email}</Label>
              <Input id="profile-email" disabled value={currentProfile.email} />
            </div>

            <FormNotice message={submitState.notice} />

            <Button className="mt-5 w-full" loading={submitState.isPending} size="lg">
              <Save aria-hidden="true" className="size-4" />
              {messages.form.save}
            </Button>

            <Link
              className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
              href={withLocale(locale, `/users/${currentProfile.nickname}`)}
            >
              {messages.form.publicProfile}
            </Link>
          </div>
        </>
      }
      onSubmit={(event) => void form.handleSubmit(submitState.onSubmit)(event)}
    >
      <EditorFormHeader
        description={messages.form.description}
        editLabel={messages.form.editMode}
        eyebrow={messages.form.eyebrow}
        mode={viewMode}
        previewLabel={messages.form.previewMode}
        title={messages.form.title}
        onModeChange={setViewMode}
      />
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
          <Label htmlFor="profile-nickname">{messages.form.nickname}</Label>
          <Input
            id="profile-nickname"
            className="font-mono lowercase"
            placeholder={messages.form.nicknamePlaceholder}
            {...form.register('nickname')}
          />
          <FieldError message={form.formState.errors.nickname?.message} />
        </div>

        <div className="space-y-2">
          <MarkdownEditorField
            emptyPreviewLabel={messages.form.emptyPreview}
            id="profile-bio"
            label={messages.form.bio}
            mode={viewMode}
            placeholder={messages.form.bioPlaceholder}
            previewValue={bio}
            {...form.register('bio')}
          />
          <FieldError message={form.formState.errors.bio?.message} />
        </div>
      </div>
    </EditorFormLayout>
  )
}
