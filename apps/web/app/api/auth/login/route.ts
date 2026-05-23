import { LoginSchema } from "@repo/contracts/auth"
import { login } from "../../../../lib/api/auth"
import { createAuthErrorResponse, createAuthResponse, readRequestLocale } from "../_shared"

export async function POST(request: Request) {
  const locale = readRequestLocale(request)

  try {
    const payload = LoginSchema.parse(await request.json())
    const auth = await login(payload)

    return createAuthResponse(auth)
  } catch (error) {
    return createAuthErrorResponse(error, locale)
  }
}
