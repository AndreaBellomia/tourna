'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Save } from 'lucide-react'
import { Button } from '@repo/ui/button'
import { Card } from '@repo/ui/card'
import { Input } from '@repo/ui/input'
import { Label } from '@repo/ui/label'
import { Select } from '@repo/ui/select'
import {
  CreateTeamRequestSchema,
  UpdateTeamRequestSchema,
  type CreateTeamInput,
  type TeamDetailResponse,
  type UpdateTeamInput,
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
import { submitTeam, updateTeam, uploadTeamLogo } from '~/features/teams/services/team-client'

const visibilityOptions = ['private', 'unlisted', 'public'] as const

type TeamFormProps = {
  locale: Locale
  messages: Messages['teams']
  mode: 'create' | 'edit'
  team?: TeamDetailResponse
}

type TeamFormValues = CreateTeamInput & {
  logoObjectKey?: string | null
}

export function TeamForm({ locale, messages, mode, team }: TeamFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [viewMode, setViewMode] = useState<EditorViewMode>('edit')
  const [pendingLogoUrl, setPendingLogoUrl] = useState<string | null>(null)
  const [isUploadingLogo, startLogoUploadTransition] = useTransition()
  const form = useForm<TeamFormValues>({
    defaultValues: {
      name: team?.name ?? '',
      tag: team?.tag ?? '',
      description: team?.description ?? '',
      logoObjectKey: team?.logoObjectKey,
      visibility: team?.visibility ?? 'private',
    },
  })
  const description = form.watch('description')
  const logoObjectKey = form.watch('logoObjectKey')
  const visibility = form.watch('visibility')
  const logoUrl = logoObjectKey === team?.logoObjectKey ? (team?.logoUrl ?? null) : pendingLogoUrl
  const title = mode === 'create' ? messages.form.title : messages.detail.editTitle
  const submitLabel = mode === 'create' ? messages.form.submit : messages.form.save
  const canSubmit = mode === 'create' || team?.viewerMembership?.canManage

  const schema = useMemo(
    () => (mode === 'create' ? CreateTeamRequestSchema : UpdateTeamRequestSchema),
    [mode],
  )
  const submitState = useZodSubmit<TeamFormValues, typeof schema, TeamDetailResponse>({
    failedMessage: messages.form.failed,
    form,
    invalidMessage: messages.form.invalid,
    schema,
    normalize: (values) => ({
      ...values,
      logoObjectKey: values.logoObjectKey || null,
    }),
    submit: (values) =>
      mode === 'create'
        ? submitTeam(values as CreateTeamInput)
        : updateTeam(team?.id ?? '', values as UpdateTeamInput),
    onSuccess: (savedTeam, { setNotice }) => {
      setNotice(mode === 'create' ? messages.form.success : messages.form.saved)
      router.push(withLocale(locale, `/teams/${savedTeam.slug}`))
      router.refresh()
    },
  })

  function onLogoSelected(file: File | undefined) {
    if (!file || !team) return

    submitState.setNotice(null)
    if (file.size > 4 * 1024 * 1024) {
      submitState.setNotice(messages.form.uploadFailed)
      return
    }

    const localPreviewUrl = URL.createObjectURL(file)
    setPendingLogoUrl(localPreviewUrl)

    startLogoUploadTransition(() => {
      void uploadTeamLogo(team, file)
        .then((object) => {
          setPendingLogoUrl(object.publicUrl ?? localPreviewUrl)
          form.setValue('logoObjectKey', object.key, {
            shouldDirty: true,
            shouldValidate: true,
          })
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
          {team ? (
            <ImageUploadControl
              actionLabel={messages.form.uploadLogo}
              fallbackLabel={team.tag || 'TM'}
              help={messages.form.logoHelp}
              imageUrl={logoUrl}
              inputRef={fileInputRef}
              isUploading={isUploadingLogo}
              label={messages.form.logo}
              removeLabel={logoObjectKey ? messages.form.removeLogo : undefined}
              onFileSelected={onLogoSelected}
              onRemove={
                logoObjectKey
                  ? () => {
                      setPendingLogoUrl(null)
                      form.setValue('logoObjectKey', null, { shouldDirty: true })
                    }
                  : undefined
              }
            />
          ) : null}

          <Card className="p-5" variant="panel">
            <div className="space-y-2">
              <Label htmlFor="create-team-visibility">{messages.form.visibility}</Label>
              <Select
                id="create-team-visibility"
                disabled={!canSubmit}
                options={visibilityOptions.map((option) => ({
                  value: option,
                  label: messages.visibility[option],
                }))}
                value={visibility}
                onValueChange={(value) =>
                  form.setValue('visibility', value as TeamFormValues['visibility'], {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
            </div>

            <FormNotice message={submitState.notice} />

            <Button
              className="mt-5 w-full"
              disabled={!canSubmit}
              loading={submitState.isPending}
              size="lg"
            >
              <Save aria-hidden="true" className="size-4" />
              {submitLabel}
            </Button>
          </Card>
        </>
      }
      onSubmit={(event) => void form.handleSubmit(submitState.onSubmit)(event)}
    >
      <EditorFormHeader
        editLabel={messages.form.editMode}
        eyebrow={messages.form.eyebrow}
        mode={viewMode}
        previewLabel={messages.form.previewMode}
        title={title}
        onModeChange={setViewMode}
      />
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
          <Label htmlFor="team-tag">{messages.form.tag}</Label>
          <Input
            id="team-tag"
            className="font-mono uppercase"
            maxLength={4}
            placeholder={messages.form.tagPlaceholder}
            {...form.register('tag')}
            disabled={!canSubmit}
          />
          <FieldError message={form.formState.errors.tag?.message} />
        </div>

        <div className="space-y-2">
          <MarkdownEditorField
            emptyPreviewLabel={messages.form.emptyPreview}
            id="team-description"
            label={messages.form.summary}
            mode={viewMode}
            placeholder={messages.form.summaryPlaceholder}
            previewValue={description}
            {...form.register('description')}
            disabled={!canSubmit}
          />
          <FieldError message={form.formState.errors.description?.message} />
        </div>
      </div>
    </EditorFormLayout>
  )
}
