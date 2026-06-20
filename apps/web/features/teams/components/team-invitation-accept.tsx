'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CircleAlert, TicketCheck } from 'lucide-react'
import { Button } from '@repo/ui/components/button'
import { withLocale } from '~/lib/i18n/config'
import { useI18n, useTranslations } from '~/lib/i18n/client'
import { acceptTeamInvitation } from '~/features/teams/services/team-client'

type TeamInvitationAcceptProps = {
  code: string
}

export function TeamInvitationAccept({ code }: TeamInvitationAcceptProps) {
  const { locale } = useI18n()
  const t = useTranslations('teams')
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
          setMessage(error instanceof Error ? error.message : t('inviteAccept.failed'))
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
            <h1 className="text-xl font-semibold">{t('inviteAccept.title')}</h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{t('inviteAccept.description')}</p>
          </div>
        </div>

        <div className="mt-5 rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-sm">
          {code}
        </div>

        {message ? <p className="mt-4 text-sm text-destructive">{message}</p> : null}

        <Button className="mt-6 w-full" disabled={isPending} size="lg" onClick={onAccept}>
          {t('inviteAccept.submit')}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </section>
  )
}
