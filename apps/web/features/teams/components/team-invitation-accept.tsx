'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CircleAlert, TicketCheck } from 'lucide-react'
import { Button } from '@repo/ui/button'
import { type Locale, withLocale } from '~/lib/i18n/config'
import type { Messages } from '~/lib/i18n/web-i18n'
import { acceptTeamInvitation } from '~/features/teams/services/team-client'

type TeamInvitationAcceptProps = {
  code: string
  locale: Locale
  messages: Messages['teams']['inviteAccept']
}

export function TeamInvitationAccept({ code, locale, messages }: TeamInvitationAcceptProps) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function onAccept() {
    setMessage(null)

    startTransition(() => {
      void acceptTeamInvitation(code)
        .then((result) => {
          router.replace(withLocale(locale, `/teams/${result.teamId}`))
          router.refresh()
        })
        .catch((error: unknown) => {
          setMessage(error instanceof Error ? error.message : messages.failed)
        })
    })
  }

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-8">
      <div className="w-full rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
            {message ? (
              <CircleAlert aria-hidden="true" className="size-5" />
            ) : (
              <TicketCheck aria-hidden="true" className="size-5" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold">{messages.title}</h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{messages.description}</p>
          </div>
        </div>

        <div className="mt-5 rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-sm">
          {code}
        </div>

        {message ? <p className="mt-4 text-sm text-destructive">{message}</p> : null}

        <Button className="mt-6 w-full" loading={isPending} size="lg" onClick={onAccept}>
          {messages.submit}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </section>
  )
}
