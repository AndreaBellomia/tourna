'use client'

import type { ComponentProps, ReactNode, RefObject } from 'react'
import { Camera, Eye, FilePenLine, Trash2 } from 'lucide-react'
import { Button } from '@repo/ui/button'
import { Label } from '@repo/ui/label'
import { Textarea } from '@repo/ui/textarea'
import { cn } from '@repo/ui/utils'
import { MarkdownContent } from '~/features/teams/components/markdown-content'

export type EditorViewMode = 'edit' | 'preview'

type EditorFormLayoutProps = ComponentProps<'form'> & {
  sidebar: ReactNode
}

export function EditorFormLayout({
  children,
  className,
  sidebar,
  ...props
}: EditorFormLayoutProps) {
  return (
    <form
      className={cn(
        'mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]',
        className,
      )}
      {...props}
    >
      <section className="min-w-0 rounded-lg border border-border bg-card p-5 shadow-sm">
        {children}
      </section>
      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">{sidebar}</aside>
    </form>
  )
}

type EditorFormHeaderProps = {
  eyebrow: string
  title: string
  description?: string
  mode: EditorViewMode
  editLabel: string
  previewLabel: string
  onModeChange: (mode: EditorViewMode) => void
}

export function EditorFormHeader({
  eyebrow,
  title,
  description,
  mode,
  editLabel,
  previewLabel,
  onModeChange,
}: EditorFormHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-medium text-accent">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-semibold">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="inline-flex w-fit rounded-md border border-border bg-background p-1">
        <Button
          size="sm"
          type="button"
          variant={mode === 'edit' ? 'secondary' : 'ghost'}
          onClick={() => onModeChange('edit')}
        >
          <FilePenLine aria-hidden="true" className="size-4" />
          {editLabel}
        </Button>
        <Button
          size="sm"
          type="button"
          variant={mode === 'preview' ? 'secondary' : 'ghost'}
          onClick={() => onModeChange('preview')}
        >
          <Eye aria-hidden="true" className="size-4" />
          {previewLabel}
        </Button>
      </div>
    </div>
  )
}

type MarkdownEditorFieldProps = Omit<ComponentProps<typeof Textarea>, 'value'> & {
  emptyPreviewLabel: string
  label: string
  mode: EditorViewMode
  previewValue?: string | null
}

export function MarkdownEditorField({
  emptyPreviewLabel,
  id,
  label,
  mode,
  previewValue,
  className,
  ...textareaProps
}: MarkdownEditorFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {mode === 'edit' ? (
        <Textarea
          id={id}
          className={cn('min-h-80 font-mono text-sm leading-6', className)}
          {...textareaProps}
        />
      ) : (
        <div className="min-h-80 rounded-md border border-border bg-background p-4">
          <MarkdownContent value={previewValue} emptyLabel={emptyPreviewLabel} />
        </div>
      )}
    </div>
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null

  return <p className="text-sm text-destructive">{message}</p>
}

export function FormNotice({ message }: { message?: string | null }) {
  if (!message) return null

  return (
    <p className="mt-4 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
      {message}
    </p>
  )
}

type ImageUploadControlProps = {
  accept?: string
  actionLabel: string
  fallbackLabel: string
  help: string
  imageUrl?: string | null
  inputRef: RefObject<HTMLInputElement | null>
  isUploading?: boolean
  label: string
  onFileSelected: (file: File | undefined) => void
  onRemove?: () => void
  removeLabel?: string
}

export function ImageUploadControl({
  accept = 'image/png,image/jpeg,image/webp',
  actionLabel,
  fallbackLabel,
  help,
  imageUrl,
  inputRef,
  isUploading,
  label,
  onFileSelected,
  onRemove,
  removeLabel,
}: ImageUploadControlProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted text-2xl font-semibold">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="size-full object-cover" src={imageUrl} />
          ) : (
            fallbackLabel
          )}
          <Button
            aria-label={actionLabel}
            className="absolute bottom-2 right-2 size-9 border border-border bg-background/95 shadow-sm"
            loading={isUploading}
            size="icon"
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
          >
            <Camera aria-hidden="true" className="size-4" />
          </Button>
        </div>
        <div className="min-w-0">
          <p className="font-semibold">{label}</p>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">{help}</p>
          {onRemove && removeLabel ? (
            <Button
              className="mt-3 h-8 px-2 text-xs"
              type="button"
              variant="ghost"
              onClick={onRemove}
            >
              <Trash2 aria-hidden="true" className="size-3.5" />
              {removeLabel}
            </Button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        accept={accept}
        className="sr-only"
        type="file"
        onChange={(event) => onFileSelected(event.target.files?.[0])}
      />
    </div>
  )
}
