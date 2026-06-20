'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition, type FormEvent } from 'react'
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { Alert } from '@repo/ui/alert'
import { Badge } from '@repo/ui/badge'
import { Button } from '@repo/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card'
import { Input } from '@repo/ui/input'
import { Label } from '@repo/ui/label'
import { TabsList, TabsTrigger } from '@repo/ui/tabs'
import { withLocale } from '~/lib/i18n/config'
import { useI18n, useTranslations } from '~/lib/i18n/client'
import { submitAuth } from '~/features/auth/services/auth-client'

type AuthMode = 'login' | 'signup'

export function AuthPanel() {
  const { locale } = useI18n()
  const t = useTranslations('auth')
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setFieldErrors({})

    startTransition(() => {
      void submitAuth(mode, { email, password }, locale, {
        invalidData: t('errors.invalidData'),
        invalidCredentials: t('errors.invalidCredentials'),
        requestFailed: t('errors.requestFailed'),
        email: t('errors.email'),
        password: t('errors.password'),
      }).then((result) => {
        if (!result.ok) {
          setMessage(result.message)
          setFieldErrors(result.issues ?? {})
          return
        }

        router.replace(withLocale(locale, '/dashboard'))
      })
    })
  }

  return (
    <Card className="w-full max-w-md" variant="panel">
      <CardHeader className="gap-4">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="outline" className="gap-1.5">
            <ShieldCheck aria-hidden="true" className="size-3.5 text-success" />
            {t('badge')}
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">{t('version')}</span>
        </div>

        <div className="space-y-2">
          <CardTitle>{t(`${mode}.title`)}</CardTitle>
          <CardDescription>{t(`${mode}.description`)}</CardDescription>
        </div>

        <TabsList aria-label="Seleziona flusso di autenticazione">
          <TabsTrigger type="button" active={mode === 'login'} onClick={() => setMode('login')}>
            {t('login.tab')}
          </TabsTrigger>
          <TabsTrigger type="button" active={mode === 'signup'} onClick={() => setMode('signup')}>
            {t('signup.tab')}
          </TabsTrigger>
        </TabsList>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">{t('fields.email')}</Label>
            <div className="relative">
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="email"
                autoComplete="email"
                inputMode="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t('fields.emailPlaceholder')}
                required
                type="email"
                value={email}
                className="pl-9"
              />
            </div>
            <FieldError messages={fieldErrors.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('fields.password')}</Label>
            <div className="relative">
              <LockKeyhole
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={8}
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t('fields.passwordPlaceholder')}
                required
                type="password"
                value={password}
                className="pl-9"
              />
            </div>
            <FieldError messages={fieldErrors.password} />
          </div>

          {message ? (
            <Alert variant="destructive">{message}</Alert>
          ) : null}

          <Button className="w-full" loading={isPending} size="lg" type="submit">
            {t(`${mode}.action`)}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null

  return <p className="text-sm text-destructive">{messages[0]}</p>
}
