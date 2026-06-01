import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import {
  ArrowLeft,
  Crown,
  ShieldCheck,
  Trophy,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@repo/ui/badge'
import { Button } from '@repo/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card'
import { Input } from '@repo/ui/input'
import { Label } from '@repo/ui/label'
import { Select } from '@repo/ui/select'
import { Textarea } from '@repo/ui/textarea'
import { getTeam } from '../../../../lib/api/teams/team.request'
import { authCookieNames } from '../../../../lib/auth/cookies'
import { isLocale, resolveLocale, withLocale } from '../../../../lib/i18n/config'
import { getMessages } from '../../../../lib/i18n/web-i18n'

type TeamDetailPageProps = {
  params: Promise<{ locale: string; teamId: string }>
}

const visibilityOptions = ['private', 'unlisted', 'public'] as const

export async function generateMetadata({ params }: TeamDetailPageProps): Promise<Metadata> {
  const { locale, teamId } = await params
  const messages = getMessages(resolveLocale(locale))
  const team = await getTeam(teamId).catch(() => null)

  return {
    title: team ? team.name : messages.teams.metadata.title,
    description: team?.description ?? messages.teams.metadata.description,
  }
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { locale, teamId } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const cookieStore = await cookies()

  if (!cookieStore.has(authCookieNames.accessToken)) {
    redirect(withLocale(locale, '/login'))
  }

  const messages = getMessages(locale)
  const team = await getTeam(teamId).catch(() => null)

  if (!team) {
    notFound()
  }

  const createdAt = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(team.createdAt))

  return (
    <main className="min-h-screen bg-background px-5 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Trophy aria-hidden="true" className="size-5" />
            </div>
            <div>
              <p className="text-xl font-semibold leading-none">{messages.metadata.appName}</p>
              <p className="mt-1 text-sm text-muted-foreground">{messages.dashboard.product}</p>
            </div>
          </div>
          <Link
            className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
            href={withLocale(locale, '/teams')}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            {messages.teams.detail.back}
          </Link>
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-5">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-primary text-lg font-semibold text-primary-foreground">
                    {team.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <Badge variant="secondary" className="mb-3">
                      {messages.teams.detail.overview}
                    </Badge>
                    <h1 className="truncate text-3xl font-semibold tracking-normal">{team.name}</h1>
                    <p className="mt-1 font-mono text-sm text-muted-foreground">@{team.slug}</p>
                    <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
                      {team.description ?? messages.teams.form.summaryPlaceholder}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Badge variant={team.visibility === 'public' ? 'success' : 'outline'}>
                    {messages.teams.visibility[team.visibility]}
                  </Badge>
                  <Badge variant="outline">{team.status}</Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Metric label={messages.teams.detail.status} value={team.status} icon={ShieldCheck} />
              <Metric label={messages.teams.detail.created} value={createdAt} icon={Trophy} />
              <Metric label={messages.teams.detail.members} value="0" icon={Users} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{messages.teams.detail.editTitle}</CardTitle>
                <CardDescription>{messages.teams.detail.editDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-team-name">{messages.teams.form.name}</Label>
                    <Input id="edit-team-name" defaultValue={team.name} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-team-visibility">{messages.teams.form.visibility}</Label>
                    <Select id="edit-team-visibility" defaultValue={team.visibility} disabled>
                      {visibilityOptions.map((visibility) => (
                        <option key={visibility} value={visibility}>
                          {messages.teams.visibility[visibility]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="edit-team-description">{messages.teams.form.summary}</Label>
                    <Textarea
                      id="edit-team-description"
                      defaultValue={team.description ?? ''}
                      disabled
                    />
                  </div>
                  <Button className="md:w-fit" disabled type="button">
                    {messages.teams.detail.disabledAction}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">{messages.teams.detail.membersTitle}</CardTitle>
                  <Users aria-hidden="true" className="size-5 text-muted-foreground" />
                </div>
                <CardDescription>{messages.teams.detail.membersDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Owner', 'Captain', 'Player'].map((role) => (
                  <div
                    className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
                    key={role}
                  >
                    <span className="text-sm font-medium">{role}</span>
                    <Badge variant="outline">0</Badge>
                  </div>
                ))}
                <Button className="w-full" disabled type="button" variant="outline">
                  <UserPlus aria-hidden="true" className="size-4" />
                  {messages.teams.detail.disabledAction}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">
                    {messages.teams.detail.permissionsTitle}
                  </CardTitle>
                  <Crown aria-hidden="true" className="size-5 text-muted-foreground" />
                </div>
                <CardDescription>{messages.teams.detail.permissionsDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled type="button" variant="secondary">
                  {messages.teams.detail.disabledAction}
                </Button>
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>
    </main>
  )
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="truncate text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}
