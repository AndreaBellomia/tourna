import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2, CircleAlert } from 'lucide-react'
import { buttonVariants } from '@repo/ui/button'
import { verifyEmail } from '~/lib/api/auth/auth.request'
import { isLocale, resolveLocale, withLocale } from '~/lib/i18n/config'
import { getMessages } from '~/lib/i18n/web-i18n'

type VerifyEmailPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ token?: string }>
}

export async function generateMetadata({ params }: VerifyEmailPageProps): Promise<Metadata> {
  const { locale } = await params
  const messages = getMessages(resolveLocale(locale))

  return {
    title: messages.auth.emailVerification.metadataTitle,
    description: messages.auth.emailVerification.metadataDescription,
  }
}

export default async function VerifyEmailPage({ params, searchParams }: VerifyEmailPageProps) {
  const { locale } = await params
  const { token } = await searchParams

  if (!isLocale(locale)) {
    notFound()
  }

  const messages = getMessages(locale)
  const result = token ? await verifyToken(token) : { ok: false }
  const Icon = result.ok ? CheckCircle2 : CircleAlert

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-8">
      <section className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
            <Icon aria-hidden="true" className="size-5" />
          </div>
          <div>
            <p className="text-xl font-semibold">
              {result.ok ? messages.auth.emailVerification.successTitle : messages.auth.emailVerification.failedTitle}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {result.ok
                ? messages.auth.emailVerification.successDescription
                : messages.auth.emailVerification.failedDescription}
            </p>
          </div>
        </div>

        <Link
          className={buttonVariants({ className: 'mt-6 w-full' })}
          href={withLocale(locale, '/profile')}
        >
          {messages.auth.emailVerification.profileAction}
        </Link>
      </section>
    </main>
  )
}

async function verifyToken(token: string) {
  try {
    const result = await verifyEmail(token)

    return { ok: result.verified }
  } catch {
    return { ok: false }
  }
}
