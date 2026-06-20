'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Check, Copy, LinkIcon, MailPlus } from 'lucide-react'
import {
  TeamInvitationRequestSchema,
  type TeamDetailResponse,
  type TeamInvitationCreateResponse,
  type TeamInvitationInput,
} from '@repo/contracts'
import { Button } from '@repo/ui/components/button'
import { Dialog, DialogContent, DialogTrigger } from '@repo/ui/components/dialog'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select'
import { withLocale } from '~/lib/i18n/config'
import { useI18n, useTranslations } from '~/lib/i18n/client'
import { FieldError, FormNotice } from '~/features/common/components/editor-form'
import { useZodSubmit } from '~/features/common/services/form-submit'
import { createTeamInvitation } from '~/features/teams/services/team-client'

type TeamInvitationModalFormProps = {
  team: Pick<TeamDetailResponse, 'id'>
  onInvitationCreated?: () => void
}

type InvitationRole = TeamInvitationInput['role']

type TeamInvitationModalFormValues = {
  role: InvitationRole
  maxUses: number
  expiresAt: string
}

const invitationRoles: InvitationRole[] = ['player', 'substitute', 'coach', 'manager', 'captain']

const defaultValues: TeamInvitationModalFormValues = {
  role: 'player',
  maxUses: 1,
  expiresAt: defaultExpiryInputValue(),
}

export function TeamInvitationModalForm({
  team,
  onInvitationCreated,
}: TeamInvitationModalFormProps) {
  const { locale } = useI18n()
  const t = useTranslations('teams')
  const [open, setOpen] = useState(false)
  const [origin, setOrigin] = useState('')
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)
  const [invitation, setInvitation] = useState<TeamInvitationCreateResponse | null>(null)
  const form = useForm<TeamInvitationModalFormValues>({
    defaultValues,
  })
  const role = form.watch('role')
  const submitState = useZodSubmit<
    TeamInvitationModalFormValues,
    typeof TeamInvitationRequestSchema,
    TeamInvitationCreateResponse
  >({
    failedMessage: t('invites.failed'),
    form,
    invalidMessage: t('invites.invalid'),
    normalize: (values) => {
      const expiresAtDate = new Date(values.expiresAt)

      return {
        ...values,
        expiresAt: Number.isNaN(expiresAtDate.getTime())
          ? values.expiresAt
          : expiresAtDate.toISOString(),
      }
    },
    onSuccess: (createdInvitation, { setNotice }) => {
      setInvitation(createdInvitation)
      setNotice(t('invites.created'))
      onInvitationCreated?.()
    },
    schema: TeamInvitationRequestSchema,
    submit: (values) => createTeamInvitation(team.id, values),
  })

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const invitationLink =
    invitation && origin
      ? `${origin}${withLocale(locale, `/teams/invitations/${invitation.code}`)}`
      : ''

  function onOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (nextOpen) return

    form.reset(defaultValues)
    setInvitation(null)
    setCopied(null)
    submitState.setNotice(null)
  }

  function copyValue(value: string, target: 'code' | 'link') {
    if (!value) return

    void navigator.clipboard.writeText(value).then(() => {
      setCopied(target)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <MailPlus aria-hidden="true" className="size-4" />
          {t('detail.inviteButton')}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <form
          className="space-y-4"
          onSubmit={(event) => void form.handleSubmit(submitState.onSubmit)(event)}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">{t('invites.title')}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {t('invites.description')}
              </p>
            </div>
          </div>

          {invitation ? (
            <div className="space-y-3 rounded-md border border-border bg-muted/30 p-3">
              <CopyField
                copied={copied === 'code'}
                label={t('invites.code')}
                value={invitation.code}
                onCopy={() => copyValue(invitation.code, 'code')}
              />
              <CopyField
                copied={copied === 'link'}
                icon="link"
                label={t('invites.link')}
                value={invitationLink}
                onCopy={() => copyValue(invitationLink, 'link')}
              />
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="team-invite-role">{t('invites.role')}</Label>
                  <Select
                    value={role}
                    onValueChange={(value) =>
                      form.setValue('role', value as InvitationRole, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger id="team-invite-role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {invitationRoles.map((option) => (
                        <SelectItem key={option} value={option}>
                          {t(`invites.roles.${option}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={form.formState.errors.role?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team-invite-max-uses">{t('invites.maxUses')}</Label>
                  <Input
                    id="team-invite-max-uses"
                    max={100}
                    min={1}
                    type="number"
                    {...form.register('maxUses', { valueAsNumber: true })}
                  />
                  <FieldError message={form.formState.errors.maxUses?.message} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-invite-expires-at">{t('invites.expiresAt')}</Label>
                <Input
                  id="team-invite-expires-at"
                  min={formatDateTimeLocal(new Date())}
                  type="datetime-local"
                  {...form.register('expiresAt')}
                />
                <FieldError message={form.formState.errors.expiresAt?.message} />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  aria-label={t('invites.submit')}
                  disabled={submitState.isPending}
                  size="default"
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {t('form.cancel')}
                </Button>
                <Button
                  aria-label={t('invites.submit')}
                  disabled={submitState.isPending}
                  size="default"
                  type="submit"
                >
                  {t('invites.submit')}
                </Button>
              </div>
            </>
          )}

          <FormNotice message={submitState.notice} />
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CopyField({
  copied,
  icon = 'copy',
  label,
  value,
  onCopy,
}: {
  copied: boolean
  icon?: 'copy' | 'link'
  label: string
  value: string
  onCopy: () => void
}) {
  const Icon = copied ? Check : icon === 'link' ? LinkIcon : Copy

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input className="font-mono text-xs" readOnly value={value} />
        <Button aria-label={label} size="icon" type="button" variant="outline" onClick={onCopy}>
          <Icon aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function defaultExpiryInputValue() {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  return formatDateTimeLocal(expiresAt)
}

function formatDateTimeLocal(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}
