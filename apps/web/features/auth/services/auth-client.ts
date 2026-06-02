import { LoginSchema, SignupSchema, type LoginInput, type SignupInput } from '@repo/contracts/auth'
import { z } from 'zod'
import { ClientApiError } from '../../common/services/client-api-error'
import { clientApiRequest } from '../../common/services/client-api'
import { type Locale } from '../../../lib/i18n/config'

type AuthMode = 'login' | 'signup'

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
  const schema = mode === 'login' ? LoginSchema : SignupSchema
  const parsed = schema.safeParse(values)

  if (!parsed.success) {
    return {
      ok: false,
      message: messages.invalidData,
      issues: translateFieldErrors(z.flattenError(parsed.error).fieldErrors, messages),
    }
  }

  try {
    const auth = await clientApiRequest({
      path: `/api/auth/${mode}`,
      schema: clientAuthResponseSchema,
      method: 'POST',
      headers: {
        'x-tourna-locale': locale,
      },
      body: parsed.data,
      fallbackErrorMessage: messages.requestFailed,
      redirectToLoginOnUnauthorized: false,
    })

    return { ok: true, sessionId: auth.sessionId }
  } catch (error) {
    if (!(error instanceof ClientApiError)) {
      throw error
    }

    return {
      ok: false,
      message: readErrorMessage(error, messages),
      issues: translateFieldErrors(readIssues(error), messages),
    }
  }
}

function readErrorMessage(error: ClientApiError, messages: AuthErrorMessages) {
  if (error.message) {
    return error.message.toLowerCase().includes('credential')
      ? messages.invalidCredentials
      : error.message
  }

  return messages.requestFailed
}

function readIssues(error: ClientApiError) {
  if (error.details && typeof error.details === 'object' && 'issues' in error.details) {
    return error.details.issues as Record<string, string[]>
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
      fieldIssues.map(() => (field === 'email' ? messages.email : messages.password)),
    ]),
  )
}
