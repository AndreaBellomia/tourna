'use client'

import { useEffect, useState, useTransition, type FormEvent } from 'react'
import { Check, Copy, LinkIcon, Send } from 'lucide-react'
import { Alert } from '@repo/ui/alert'
import { Button } from '@repo/ui/button'
import { Card } from '@repo/ui/card'
import { Input } from '@repo/ui/input'
import { Label } from '@repo/ui/label'
import { Select } from '@repo/ui/select'
import type {
  TeamDetailResponse,
  TeamInvitationInput,
  TeamInvitationCreateResponse,
} from '@repo/contracts'
import { type Locale, withLocale } from '~/lib/i18n/config'
import type { Messages } from '~/lib/i18n/web-i18n'
import { createTeamInvitation } from '~/features/teams/services/team-client'

type InvitationRole = TeamInvitationInput['role']

const invitationRoles: InvitationRole[] = ['player', 'substitute', 'coach', 'manager', 'captain']

type TeamInvitationPanelProps = {
  locale: Locale
  messages: Messages['teams']['invites']
  team: Pick<TeamDetailResponse, 'id'>
}

export function TeamInvitationPanel({ locale, messages, team }: TeamInvitationPanelProps) {
  const [origin, setOrigin] = useState('')
  const [role, setRole] = useState<InvitationRole>('player')
  const [maxUses, setMaxUses] = useState(1)
  const [expiresAt, setExpiresAt] = useState(defaultExpiryInputValue)
  const [invitation, setInvitation] = useState<TeamInvitationCreateResponse | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const invitationLink =
    invitation && origin
      ? `${origin}${withLocale(locale, `/teams/invitations/${invitation.code}`)}`
      : ''

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(null)
    setCopied(null)

    const expiresAtDate = new Date(expiresAt)

    if (Number.isNaN(expiresAtDate.getTime())) {
      setNotice(messages.invalid)
      return
    }

    startTransition(() => {
      void createTeamInvitation(team.id, {
        role,
        maxUses,
        expiresAt: expiresAtDate.toISOString(),
      })
        .then((createdInvitation) => {
          setInvitation(createdInvitation)
          setNotice(messages.created)
        })
        .catch((error: unknown) => {
          setNotice(error instanceof Error ? error.message : messages.failed)
        })
    })
  }

  function copyValue(value: string, target: 'code' | 'link') {
    if (!value) return

    void navigator.clipboard.writeText(value).then(() => {
      setCopied(target)
      setNotice(messages.copied)
    })
  }

  return (
    <Card className="p-4" variant="panel">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">{messages.title}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{messages.description}</p>
          </div>
          <Button aria-label={messages.submit} loading={isPending} size="icon" type="submit">
            <Send aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="team-invite-role">{messages.role}</Label>
            <Select
              id="team-invite-role"
              options={invitationRoles.map((option) => ({
                value: option,
                label: messages.roles[option],
              }))}
              value={role}
              onValueChange={(value) => setRole(value as InvitationRole)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-invite-max-uses">{messages.maxUses}</Label>
            <Input
              id="team-invite-max-uses"
              max={100}
              min={1}
              type="number"
              value={maxUses}
              onChange={(event) => setMaxUses(Number(event.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="team-invite-expires-at">{messages.expiresAt}</Label>
          <Input
            id="team-invite-expires-at"
            min={formatDateTimeLocal(new Date())}
            type="datetime-local"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
          />
        </div>

        {invitation ? (
          <div className="space-y-3 rounded-md border border-border bg-muted/30 p-3">
            <CopyField
              copied={copied === 'code'}
              label={messages.code}
              value={invitation.code}
              onCopy={() => copyValue(invitation.code, 'code')}
            />
            <CopyField
              copied={copied === 'link'}
              icon="link"
              label={messages.link}
              value={invitationLink}
              onCopy={() => copyValue(invitationLink, 'link')}
            />
          </div>
        ) : null}

        {notice ? <Alert variant="info">{notice}</Alert> : null}
      </form>
    </Card>
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
