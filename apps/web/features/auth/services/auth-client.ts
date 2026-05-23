import { LoginSchema, SignupSchema, type LoginInput, type SignupInput } from "@repo/contracts/auth"
import { z } from "zod"
import { type Locale } from "../../../lib/i18n/config"

type AuthMode = "login" | "signup"

export type AuthClientResult =
  | { ok: true; sessionId: string }
  | { ok: false; message: string; issues?: Record<string, string[]> }

type AuthErrorMessages = {
  invalidData: string
  invalidCredentials: string
  requestFailed: string
  email: string
  password: string
}

const clientAuthResponseSchema = z.object({
  sessionId: z.string(),
})

export async function submitAuth(
  mode: AuthMode,
  values: LoginInput | SignupInput,
  locale: Locale,
  messages: AuthErrorMessages,
): Promise<AuthClientResult> {
  const schema = mode === "login" ? LoginSchema : SignupSchema
  const parsed = schema.safeParse(values)

  if (!parsed.success) {
    return {
      ok: false,
      message: messages.invalidData,
      issues: translateFieldErrors(z.flattenError(parsed.error).fieldErrors, messages),
    }
  }

  const response = await fetch(`/api/auth/${mode}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tourna-locale": locale,
    },
    body: JSON.stringify(parsed.data),
  })

  const payload: unknown = await response.json().catch(() => ({}))

  if (!response.ok) {
    return {
      ok: false,
      message: readErrorMessage(payload, messages),
      issues: translateFieldErrors(readIssues(payload), messages),
    }
  }

  const auth = clientAuthResponseSchema.parse(payload)

  return { ok: true, sessionId: auth.sessionId }
}

function readErrorMessage(payload: unknown, messages: AuthErrorMessages) {
  if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string") {
    return payload.message.toLowerCase().includes("credential")
      ? messages.invalidCredentials
      : payload.message
  }

  return messages.requestFailed
}

function readIssues(payload: unknown) {
  if (payload && typeof payload === "object" && "issues" in payload) {
    return payload.issues as Record<string, string[]>
  }

  return undefined
}

function translateFieldErrors(
  issues: Record<string, string[]> | undefined,
  messages: AuthErrorMessages,
) {
  if (!issues) return undefined

  return Object.fromEntries(
    Object.entries(issues).map(([field, fieldIssues]) => [
      field,
      fieldIssues.map(() => (field === "email" ? messages.email : messages.password)),
    ]),
  )
}
