import type { Metadata } from "next"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { Activity, GitBranch, RadioTower, Trophy } from "lucide-react"
import { Badge } from "@repo/ui/badge"
import { authCookieNames } from "../../../lib/auth/cookies"
import { isLocale, resolveLocale, withLocale } from "../../../lib/i18n/config"
import { getMessages } from "../../../lib/i18n/web-i18n"
import { AuthPanel } from "../../../features/auth/components/auth-panel"

type LoginPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { locale } = await params
  const messages = getMessages(resolveLocale(locale))

  return {
    title: messages.metadata.loginTitle,
    description: messages.metadata.loginDescription,
  }
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const messages = getMessages(locale)
  const cookieStore = await cookies()

  if (cookieStore.has(authCookieNames.accessToken)) {
    redirect(withLocale(locale, "/dashboard"))
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ffffff_0,#f7f5ee_34%,#ebe2cf_100%)]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-10 px-5 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center lg:py-10">
        <section className="flex min-h-[520px] flex-col justify-between rounded-lg border border-border bg-[#151816] p-5 text-[#f8f5ec] shadow-[0_30px_90px_rgba(23,23,18,0.22)] md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Trophy aria-hidden="true" className="size-5" />
              </div>
              <div>
                <p className="text-lg font-semibold leading-none">{messages.metadata.appName}</p>
                <p className="mt-1 text-sm text-[#bfc6b9]">{messages.loginPage.product}</p>
              </div>
            </div>
            <Badge variant="success" className="gap-1.5">
              <RadioTower aria-hidden="true" className="size-3.5" />
              {messages.loginPage.liveReady}
            </Badge>
          </div>

          <div className="max-w-2xl py-14 md:py-20">
            <p className="mb-4 inline-flex items-center gap-2 rounded-md border border-[#343b35] px-3 py-1 text-sm text-[#dfe8d8]">
              <Activity aria-hidden="true" className="size-4 text-accent" />
              {messages.loginPage.eyebrow}
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-normal md:text-6xl">
              {messages.loginPage.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#cfd6ca] md:text-lg">
              {messages.loginPage.description}
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_0.86fr]">
            <div className="rounded-lg border border-[#343b35] bg-[#1d211e] p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-[#f8f5ec]">
                  {messages.loginPage.matchMonitor}
                </span>
                <span className="h-2 w-2 rounded-full bg-accent" />
              </div>
              <div className="space-y-3">
                {messages.loginPage.liveMatches.map((match) => (
                  <div
                    className="grid grid-cols-[1fr_auto] gap-3 rounded-md border border-[#303730] bg-[#121613] p-3"
                    key={`${match.game}-${match.teams}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#f8f5ec]">{match.teams}</p>
                      <p className="mt-1 truncate text-xs text-[#9da89b]">
                        {match.game} / {match.stage}
                      </p>
                    </div>
                    <span className="font-mono text-sm text-accent">{match.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#343b35] bg-[#1d211e] p-4">
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
          <AuthPanel locale={locale} messages={messages.auth} />
        </section>
      </div>
    </main>
  )
}

function Connector() {
  return <span className="h-px w-full bg-[#465044]" />
}

function BracketNode({ label, tone }: { label: string; tone: "accent" | "default" | "muted" }) {
  const toneClass =
    tone === "accent"
      ? "border-accent bg-accent text-accent-foreground"
      : tone === "muted"
        ? "border-[#465044] bg-[#252b26] text-[#cdd7ca]"
        : "border-[#465044] bg-[#121613] text-[#f8f5ec]"

  return <span className={`rounded-md border px-3 py-2 text-center font-medium ${toneClass}`}>{label}</span>
}
