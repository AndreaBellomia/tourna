"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition, type FormEvent } from "react"
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react"
import { Badge } from "@repo/ui/badge"
import { Button } from "@repo/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card"
import { Input } from "@repo/ui/input"
import { Label } from "@repo/ui/label"
import { TabsList, TabsTrigger } from "@repo/ui/tabs"
import { type Locale, withLocale } from "../../../lib/i18n/config"
import { type Messages } from "../../../lib/i18n/web-i18n"
import { submitAuth } from "../services/auth-client"

type AuthMode = "login" | "signup"

type AuthMessages = Messages["auth"]

export function AuthPanel({ locale, messages }: { locale: Locale; messages: AuthMessages }) {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setFieldErrors({})

    startTransition(() => {
      void submitAuth(mode, { email, password }, locale, messages.errors).then((result) => {
        if (!result.ok) {
          setMessage(result.message)
          setFieldErrors(result.issues ?? {})
          return
        }

        router.replace(withLocale(locale, "/dashboard"))
      })
    })
  }

  const content = messages[mode]

  return (
    <Card className="w-full max-w-md border-[#d8d0bd] bg-card/95 shadow-[0_24px_70px_rgba(23,23,18,0.14)]">
      <CardHeader className="gap-4">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="outline" className="gap-1.5">
            <ShieldCheck aria-hidden="true" className="size-3.5 text-success" />
            {messages.badge}
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">{messages.version}</span>
        </div>

        <div className="space-y-2">
          <CardTitle>{content.title}</CardTitle>
          <CardDescription>{content.description}</CardDescription>
        </div>

        <TabsList aria-label="Seleziona flusso di autenticazione">
          <TabsTrigger type="button" active={mode === "login"} onClick={() => setMode("login")}>
            {messages.login.tab}
          </TabsTrigger>
          <TabsTrigger type="button" active={mode === "signup"} onClick={() => setMode("signup")}>
            {messages.signup.tab}
          </TabsTrigger>
        </TabsList>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">{messages.fields.email}</Label>
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
                placeholder={messages.fields.emailPlaceholder}
                required
                type="email"
                value={email}
                className="pl-9"
              />
            </div>
            <FieldError messages={fieldErrors.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{messages.fields.password}</Label>
            <div className="relative">
              <LockKeyhole
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={8}
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder={messages.fields.passwordPlaceholder}
                required
                type="password"
                value={password}
                className="pl-9"
              />
            </div>
            <FieldError messages={fieldErrors.password} />
          </div>

          {message ? (
            <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {message}
            </p>
          ) : null}

          <Button className="w-full" loading={isPending} size="lg" type="submit">
            {content.action}
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
