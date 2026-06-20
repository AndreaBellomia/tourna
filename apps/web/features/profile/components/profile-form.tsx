'use client'

import Link from 'next/link'
import { useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { CheckCircle2, MailCheck, Save, Send } from 'lucide-react'
import { Badge } from '@repo/ui/components/badge'
import { Button, buttonVariants } from '@repo/ui/components/button'
import { Card } from '@repo/ui/components/card'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import {
  UpdateProfileRequestSchema,
  type ProfileSummaryResponse,
  type UpdateProfileInput,
} from '@repo/contracts'
import { withLocale } from '~/lib/i18n/config'
import { useI18n, useTranslations } from '~/lib/i18n/client'
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
import {
  resendEmailVerification,
  updateProfile,
  uploadProfileAvatar,
} from '~/features/profile/services/profile-client'

type ProfileFormProps = {
  profile: ProfileSummaryResponse
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { locale } = useI18n()
  const t = useTranslations('profile')
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [currentProfile, setCurrentProfile] = useState(profile)
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<EditorViewMode>('edit')
  const [isUploading, startUploadTransition] = useTransition()
  const [isResendingVerification, startResendVerificationTransition] = useTransition()
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
    failedMessage: t('form.failed'),
    form,
    invalidMessage: t('form.invalid'),
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
      setNotice(t('form.saved'))
      router.refresh()
    },
  })

  function onAvatarSelected(file: File | undefined) {
    if (!file) return

    submitState.setNotice(null)
    if (file.size > 4 * 1024 * 1024) {
      submitState.setNotice(t('form.uploadFailed'))
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
          submitState.setNotice(t('form.saved'))
        })
        .catch((error: unknown) => {
          submitState.setNotice(error instanceof Error ? error.message : t('form.uploadFailed'))
        })
    })
  }

  function onResendVerificationEmail() {
    submitState.setNotice(null)

    startResendVerificationTransition(() => {
      void resendEmailVerification()
        .then(() => {
          submitState.setNotice(t('form.verificationSent'))
        })
        .catch((error: unknown) => {
          submitState.setNotice(
            error instanceof Error ? error.message : t('form.verificationFailed'),
          )
        })
    })
  }

  return (
    <EditorFormLayout
      sidebar={
        <>
          <ImageUploadControl
            actionLabel={t('form.upload')}
            fallbackLabel={initials || 'U'}
            help={t('form.avatarHelp')}
            imageUrl={avatarUrl}
            inputRef={fileInputRef}
            isUploading={isUploading}
            label={t('form.avatar')}
            removeLabel={avatarObjectKey ? t('form.removeAvatar') : undefined}
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

          <Card className="p-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="profile-email">{t('form.email')}</Label>
                <Badge variant={currentProfile.emailVerified ? 'secondary' : 'outline'}>
                  {currentProfile.emailVerified
                    ? t('form.emailVerified')
                    : t('form.emailUnverified')}
                </Badge>
              </div>
              <Input id="profile-email" disabled value={currentProfile.email} />
            </div>

            <FormNotice message={submitState.notice} />

            {!currentProfile.emailVerified ? (
              <Button
                className="mt-5 w-full"
                disabled={isResendingVerification}
                type="button"
                variant="outline"
                onClick={onResendVerificationEmail}
              >
                <Send aria-hidden="true" className="size-4" />
                {t('form.resendVerification')}
              </Button>
            ) : (
              <div className="mt-5 flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                <CheckCircle2 aria-hidden="true" className="size-4 text-success" />
                {t('form.emailVerifiedDescription')}
              </div>
            )}

            <Button className="mt-5 w-full" disabled={submitState.isPending} size="lg">
              {currentProfile.emailVerified ? (
                <Save aria-hidden="true" className="size-4" />
              ) : (
                <MailCheck aria-hidden="true" className="size-4" />
              )}
              {t('form.save')}
            </Button>

            <Link
              className={buttonVariants({ variant: 'outline', className: 'mt-3 w-full' })}
              href={withLocale(locale, `/users/${currentProfile.nickname}`)}
            >
              {t('form.publicProfile')}
            </Link>
          </Card>
        </>
      }
      onSubmit={(event) => void form.handleSubmit(submitState.onSubmit)(event)}
    >
      <EditorFormHeader
        description={t('form.description')}
        editLabel={t('form.editMode')}
        eyebrow={t('form.eyebrow')}
        mode={viewMode}
        previewLabel={t('form.previewMode')}
        title={t('form.title')}
        onModeChange={setViewMode}
      />
      <div className="mt-5 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="profile-display-name">{t('form.displayName')}</Label>
          <Input
            id="profile-display-name"
            placeholder={t('form.displayNamePlaceholder')}
            {...form.register('display_name')}
          />
          <FieldError message={form.formState.errors.display_name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-nickname">{t('form.nickname')}</Label>
          <Input
            id="profile-nickname"
            className="font-mono lowercase"
            placeholder={t('form.nicknamePlaceholder')}
            {...form.register('nickname')}
          />
          <FieldError message={form.formState.errors.nickname?.message} />
        </div>

        <div className="space-y-2">
          <MarkdownEditorField
            emptyPreviewLabel={t('form.emptyPreview')}
            id="profile-bio"
            label={t('form.bio')}
            mode={viewMode}
            placeholder={t('form.bioPlaceholder')}
            previewValue={bio}
            {...form.register('bio')}
          />
          <FieldError message={form.formState.errors.bio?.message} />
        </div>
      </div>
    </EditorFormLayout>
  )
}
