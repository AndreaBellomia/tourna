import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Activity, GitBranch, RadioTower, Trophy } from 'lucide-react'
import { Badge } from '@repo/ui/badge'
import { authCookieNames } from '~/lib/auth/cookies'
import { withLocale } from '~/lib/i18n/config'
import { getMetadataTranslator, getPageI18n } from '~/lib/i18n/web-i18n'
import { AuthPanel } from '~/features/auth/components/auth-panel'

type LoginPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { t } = await getMetadataTranslator(params, 'metadata')

  return {
    title: t('loginTitle'),
    description: t('loginDescription'),
  }
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale, messages } = await getPageI18n(params)
  const cookieStore = await cookies()

  if (cookieStore.has(authCookieNames.accessToken)) {
    redirect(withLocale(locale, '/dashboard'))
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-10 px-5 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center lg:py-10">
        <section className="flex min-h-[520px] flex-col justify-between rounded-lg border border-border bg-card/80 p-5 text-foreground shadow-[0_30px_90px_rgba(3,7,18,0.28)] md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Trophy aria-hidden="true" className="size-5" />
              </div>
              <div>
                <p className="text-lg font-semibold leading-none">{messages.metadata.appName}</p>
                <p className="mt-1 text-sm text-muted-foreground">{messages.loginPage.product}</p>
              </div>
            </div>
            <Badge variant="success" className="gap-1.5">
              <RadioTower aria-hidden="true" className="size-3.5" />
              {messages.loginPage.liveReady}
            </Badge>
          </div>

          <div className="max-w-2xl py-14 md:py-20">
            <p className="mb-4 inline-flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-1 text-sm text-muted-foreground">
              <Activity aria-hidden="true" className="size-4 text-accent" />
              {messages.loginPage.eyebrow}
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-normal md:text-6xl">
              {messages.loginPage.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
              {messages.loginPage.description}
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_0.86fr]">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {messages.loginPage.matchMonitor}
                </span>
                <span className="h-2 w-2 rounded-full bg-accent" />
              </div>
              <div className="space-y-3">
                {messages.loginPage.liveMatches.map((match) => (
                  <div
                    className="grid grid-cols-[1fr_auto] gap-3 rounded-md border border-border bg-background/70 p-3"
                    key={`${match.game}-${match.teams}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{match.teams}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {match.game} / {match.stage}
                      </p>
                    </div>
                    <span className="font-mono text-sm text-accent">{match.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium">
                <GitBranch aria-hidden="true" className="size-4 text-accent" />
                {messages.loginPage.bracketFlow}
              </div>
              <div className="grid grid-cols-[1fr_24px_1fr] items-center gap-2 text-sm">
                <BracketNode label="NOVA" tone="accent" />
                <Connector />
                <BracketNode label={messages.loginPage.bracket.winner} tone="muted" />
                <BracketNode label="Arcadia" tone="default" />
                <Connector />
                <BracketNode label={messages.loginPage.bracket.final} tone="accent" />
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center lg:justify-end">
          <AuthPanel />
        </section>
      </div>
    </main>
  )
}

function Connector() {
  return <span className="h-px w-full bg-border" />
}

function BracketNode({ label, tone }: { label: string; tone: 'accent' | 'default' | 'muted' }) {
  const toneClass =
    tone === 'accent'
      ? 'border-accent bg-accent text-accent-foreground'
      : tone === 'muted'
        ? 'border-border bg-muted text-muted-foreground'
        : 'border-border bg-background/70 text-foreground'

  return (
    <span className={`rounded-md border px-3 py-2 text-center font-medium ${toneClass}`}>
      {label}
    </span>
  )
}
